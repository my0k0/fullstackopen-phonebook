require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/persons')
const app = express()

app.use(cors())
app.use(express.json())
// app.use(morgan('tiny'))
morgan.token('data', function getData(req) {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(express.static('client'))

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><br/><p>${new Date()}</p>`)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    res.json(person)
  })
  .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id).then(_ => {
    res.status(204).end()
  })
  .catch(() => next(err))
})

app.post('/api/persons', async (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    res.status(400).end()
    return;
  }

  const p = await Person.findOne({name: body.name});
  if (p) 
    next(new Error('name must be unique'))

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(saveP => {
    res.json(saveP);
  })
  .catch(err => next (err))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') 
    return res.status(400).send({error: 'malformatted id'})
  else if (err.name === 'ValidationError') 
    return res.status(400).json({error: err.message})

  next(err)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})