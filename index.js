require('dotenv').config()

const express = require('express')
const app = express()
const Note = require('./models/note')

app.use(express.json())
app.use(express.static('build'))
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
app.use(requestLogger)
app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); //这个表示任意域名都可以访问，这样写不能携带cookie了。
  //res.header('Access-Control-Allow-Origin', 'http://www.baidu.com'); //这样写，只有www.baidu.com 可以访问。
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');//设置方法
  if (req.method == 'OPTIONS') {
    res.send(200); // 意思是，在正常的请求之前，会发送一个验证，是否可以请求。
  }
  else {
    next();
  }
})


const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

// done adding mongo data
app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
})

// Done
app.get('/api/notes/:id', (req, res) => {
  Note.findById(req.params.id)
    .then(foundNote => {
      if (foundNote) {
        res.json(foundNote)
      } else {
        res.status(404).end()
      }
    })
    .catch(err => {
      console.log(err)
      res.status(400).send({ error: 'malformed syntax' })
    })
})

// Doen
app.delete('/api/notes/:id', (req, res) => {
  Note.findByIdAndRemove(req.params.id)
    .then(result => {
      // 不管删除资源请求成功与否，都向响应返回204状态码
      res.status(204).end()
    })
    .catch(error => next(error))
})

// Done
app.post('/api/notes', (req, res) => {
  const body = req.body
  
  if (!body.content) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.put('/api/notes/:id', (req, res, next) => {
  const body = req.body
  
  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

app.use(errorHandler)

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})