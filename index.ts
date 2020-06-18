require('dotenv').config()

import express, { NextFunction } from 'express'
const app = express()
const usersRouter = require('./controllers/users')
const notesRouter = require('./controllers/notes')
const loginRouter = require('./controllers/login')

// middleware

// bodyParser
app.use(express.json())
// serve static files
app.use(express.static('build'))
// requestLogger
app.use((request, _response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
})
// CROS middleware
app.use('*', (request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*'); //这个表示任意域名都可以访问，这样写不能携带cookie了。
  //response.header('Access-Control-Allow-Origin', 'http://www.baidu.com'); //这样写，只有www.baidu.com 可以访问。
  response.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  response.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');//设置方法
  if (request.method == 'OPTIONS') {
    response.sendStatus(200); // 意思是，在正常的请求之前，会发送一个验证，是否可以请求。
  } else {
    next();
  }
})
// users router
app.use('/api/users', usersRouter)
// notes router
app.use('/api/notes', notesRouter)
// login router
app.use('/api/login', loginRouter)
// 404
app.use((_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
})
// simple error handler
app.use((error: any, {}, response: express.Response, next: NextFunction) => {
  if (error.name === 'CastError') {
    response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    response.status(401).json({ error: 'invalid token' })
  }
  next(error)
})

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})