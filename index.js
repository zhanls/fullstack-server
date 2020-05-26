require('dotenv').config()

const express = require('express')
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
app.use((request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
})
// CROS middleware
const CROS = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); //这个表示任意域名都可以访问，这样写不能携带cookie了。
  //res.header('Access-Control-Allow-Origin', 'http://www.baidu.com'); //这样写，只有www.baidu.com 可以访问。
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');//设置方法
  if (req.method == 'OPTIONS') {
    res.sendStatus(200); // 意思是，在正常的请求之前，会发送一个验证，是否可以请求。
  } else {
    next();
  }
}
app.use('*', CROS)
// users router
app.use('/api/users', usersRouter)
// notes router
app.use('/api/notes', notesRouter)
// login router
app.use('/api/login', loginRouter)
// 
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
// 
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  }
  
  next(error)
}
app.use(errorHandler)

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})