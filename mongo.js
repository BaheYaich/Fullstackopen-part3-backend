const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument') // This runs if no password is passed
  process.exit(1)
} else if (process.argv.length === 3) {
  const password = process.argv[2]

  const url = `mongodb+srv://baheyaich:${password}@phonebook.7xkpw.mongodb.net/PhonebookDB?retryWrites=true&w=majority&appName=Phonebook`

  mongoose.set('strictQuery', false)

  mongoose.connect(url)
    .then(() => {
      console.log('Connected to MongoDB')
    })
    .catch(err => {
      console.error('Error connecting to MongoDB:', err.message)
    })

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  const Person = mongoose.model('Person', personSchema, 'people')

  // Fetching contacts logic
  Person.find({})
    .then(result => {
      if (result.length === 0) {
        console.log('No contacts found in the Phonebook.')
      } else {
        console.log('Phonebook:')
        result.forEach(person => {
          console.log(`${person.name}: ${person.number}`)
        })
      }
      mongoose.connection.close()
    })
    .catch(err => {
      console.error('Error fetching contacts:', err.message)
      mongoose.connection.close()
    })

} else if (process.argv.length > 3) {
  console.log('Arguments passed:', process.argv)
  const password = process.argv[2]
  const name = process.argv[3]
  const number = process.argv[4]

  const url = `mongodb+srv://baheyaich:${password}@phonebook.7xkpw.mongodb.net/PhonebookDB?retryWrites=true&w=majority&appName=Phonebook`

  mongoose.set('strictQuery', false)

  mongoose.connect(url)
    .then(() => {
      console.log('Connected to MongoDB')
    })
    .catch(err => {
      console.error('Error connecting to MongoDB:', err.message)
    })

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  const Person = mongoose.model('Person', personSchema, 'people')

  const person = new Person({
    name: name,
    number: number,
  })

  person.save()
  // eslint-disable-next-line no-unused-vars
    .then(result => {
      console.log(`Added ${name} number ${number} to Phonebook!`)
      mongoose.connection.close()
    })
    .catch(err => {
      console.error('Error saving person:', err.message)
      mongoose.connection.close()
    })
}