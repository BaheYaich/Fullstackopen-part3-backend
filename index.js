require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(cors())

morgan.token('body', (req) => {
    return JSON.stringify(req.body)
});

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :response-time :body'))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        console.log(`Phonebook: fetching all contacts`)
        response.json(result)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.countDocuments({})
        .then(count => {
            const request_timestamp = new Date().toString();
            response.status(200).send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${request_timestamp}</p>
      `)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            console.log(`Phonebook: ${result.name} with number ${result.number} has been deleted`)
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body);

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "information missing"
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(result => {
            console.log(`Phonebook: ${result.name} with number ${result.number} has been saved`)
            response.json(result)
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
