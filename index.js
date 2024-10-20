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

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :response-time :body'))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/info', (request, response) => {
    Person.countDocuments({})
        .then(count => {
            const request_timestamp = new Date().toString();
            response.status(200).send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${request_timestamp}</p>
      `);
        })
        .catch(error => {
            console.error('Error fetching document count:', error.message);
            next(error);
        });
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
        .catch(error => {
            console.error('Error fetching person by ID:', error)
        })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
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
            response.json(result)
        })
        .catch(err => {
            console.error('Error saving person:', err.message)
        })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
