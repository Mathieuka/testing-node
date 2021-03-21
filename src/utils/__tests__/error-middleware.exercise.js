// Testing Middleware

// 🐨 you'll need both of these:
import {UnauthorizedError} from 'express-jwt'
import {buildRes, buildReq, buildNext} from 'utils/generate'
import errorMiddleware from '../error-middleware'

describe('errorMiddleware', () => {
  const message = 'Some message'

  // 🐨 Write a test for the UnauthorizedError case
  test('responds with 401 for jwt UnauthorizedError', () => {
    const error = new UnauthorizedError('some_error_code', {message})
    const res = buildRes()
    const req = buildReq()
    const next = buildNext()

    errorMiddleware(error, req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({
      code: error.code,
      message: error.message,
    })
    expect(res.json).toHaveBeenCalledTimes(1)
  })

  // 🐨 Write a test for the headersSent case
  test('call next if headerSent is true', () => {
    const error = new Error(message)
    const res = buildRes({
      headersSent: true,
    })

    const req = buildReq()
    const next = buildNext()

    errorMiddleware(error, req, res, next)

    expect(next).toHaveBeenCalledWith(error)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()

    next.mockReset()

    errorMiddleware(error, req, {...res, headersSent: false}, next)
    expect(next).not.toHaveBeenCalled()
  })

  // 🐨 Write a test for the else case (responds with a 500)
  test('Responds with 500 and the error object', () => {
    const error = new Error(message)
    const res = buildRes()
    const req = buildReq()
    const next = buildNext()

    errorMiddleware(error, req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: error.message,
      stack: error.stack,
    })
  })
})
