// Testing Controllers
import {
  buildUser,
  buildBook,
  buildRes,
  buildReq,
  buildListItem,
  buildNext,
} from 'utils/generate'

// 🐨 don't forget to import the listItemsController from '../list-items-controller'
// here, that's the thing we're testing after all :)
import * as listItemsController from '../list-items-controller'

// 🐨 getListItem calls `expandBookData` which calls `booksDB.readById`
// so you'll need to import the booksDB from '../../db/books'
import * as booksDB from '../../db/books'

// 🐨 setListItem calls `listItemsDB.readById` so i need to import the listItemDB
import * as listItemsDB from '../../db/list-items'

// 🐨 use jest.mock to mock '../../db/books' because we don't actually want to make
// database calls in this test file.
jest.mock('../../db/books')

jest.mock('../../db/list-items')

beforeEach(() => {
  jest.resetAllMocks()
})

test('getListItem returns the req.listItem', async () => {
  // 🐨 create a user
  const user = buildUser()
  // 🐨 create a book
  const book = buildBook()
  // 🐨 create a listItem that has the user as the owner and the book
  const listItem = buildListItem({ownerId: user.id, bookId: book.id})

  // 🐨 mock booksDB.readById to resolve to the book
  booksDB.readById.mockResolvedValueOnce(book)

  // 🐨 make a request object that has properties for the user and listItem
  // 💰 checkout the implementation of getListItem in ../list-items-controller
  // to see how the request object is used and what properties it needs.
  // 💰 and you can use buildReq from utils/generate
  const req = buildReq({user, listItem})

  // 🐨 make a response object
  // 💰 just use buildRes from utils/generate
  const res = buildRes()

  // 🐨 make a call to getListItem with the req and res (`await` the result)
  await listItemsController.getListItem(req, res)

  // 🐨 assert that booksDB.readById was called correctly
  expect(booksDB.readById).toHaveBeenCalledTimes(1)

  expect(booksDB.readById).toHaveBeenCalledWith(book.id)

  expect(res.json).toHaveBeenCalledWith({listItem: {...listItem, book}})
  expect(res.json).toHaveBeenCalledTimes(1)

  //🐨 assert that res.json was called correctly
  expect(res.json).toHaveBeenCalledTimes(1)
})

test('createListItem return 400 error if no bookId is found', async () => {
  const res = buildRes()
  const req = buildReq()
  await listItemsController.createListItem(req, res)
  expect(res.status).toHaveBeenCalledWith(400)
  expect(res.status).toHaveBeenCalledTimes(1)
  expect(res.json).toHaveBeenCalledTimes(1)
  expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "No bookId provided",
      },
    ]
  `)
})

describe('test business logic of setListItem', () => {
  test('setListItem call next', async () => {
    const user = buildUser()
    const res = buildRes()
    const next = buildNext()
    const listItem = buildListItem({ownerId: user.id})
    const req = buildReq({user, params: {id: listItem.id}})

    listItemsDB.readById.mockResolvedValueOnce(listItem)
    await listItemsController.setListItem(req, res, next)

    expect(listItemsDB.readById).toHaveBeenCalledTimes(1)
    expect(listItemsDB.readById).toHaveBeenCalledWith(listItem.id)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(/* nothing */)
  })

  test('setListItem return 404 if no list item is found', async () => {
    const req = buildReq({params: {id: 1}})
    const res = buildRes()
    const next = buildNext()

    await listItemsController.setListItem(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            Object {
              "message": "No list item was found with the id of 1",
            },
          ]
      `)
    expect(next).not.toHaveBeenCalled()
  })

  test('setListItem return 403 if the user is not the owner of the list item', async () => {
    const res = buildRes()
    const next = buildNext()
    const user = buildUser({id: 'FAKE_USER_ID'})
    const fakeListItemID = 'FAKE_LIST_ITEM_ID'
    const req = buildReq({params: {id: fakeListItemID}, user})

    const listItem = buildListItem({
      ownerId: 'fakeOwnerId',
      id: 'fakeListItemId',
    })

    listItemsDB.readById.mockResolvedValueOnce(listItem)

    await listItemsController.setListItem(req, res, next)

    expect(listItemsDB.readById).toHaveBeenCalledWith(fakeListItemID)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "User with id FAKE_USER_ID is not authorized to access the list item FAKE_LIST_ITEM_ID",
        },
      ]
    `)
  })
})
