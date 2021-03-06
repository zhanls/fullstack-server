const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.set('useCreateIndex', true)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(res => {
    console.log('connected to MongoDB at ' + res.connections[0].host + ":" + res.connections[0].port)
  })
  .catch(err => {
    console.log('error connecting to MongoDB Atlas', err.message)
  })

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minLength: 5
  },
  date: Date,
  important: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Note = mongoose.model('Note', noteSchema)

module.exports = Note