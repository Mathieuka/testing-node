// Testing Controllers
import {
  buildUser,
  buildBook,
  buildRes,
  buildReq,
  buildListItem,
} from 'utils/generate'

// 🐨 don't forget to import the listItemsController from '../list-items-controller'
// here, that's the thing we're testing after all :)
import * as listItemsController from '../list-items-controller'

// 🐨 getListItem calls `expandBookData` which calls `booksDB.readById`
// so you'll need to import the booksDB from '../../db/books'
import * as booksDB from '../../db/books'

// 🐨 use jest.mock to mock '../../db/books' because we don't actually want to make
// database calls in this test file.
jest.mock('../../db/books')

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
