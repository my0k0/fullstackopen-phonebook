const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = encodeURIComponent(process.argv[2])

const url = `mongodb+srv://fullstackopen:${password}@cluster0.oxk8mjo.mongodb.net/PhoneBook?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url)

const schema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model('Person', schema);

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  });

  person.save().then(result => {
    console.info(`added ${person.name} number ${person.number} to phonebook`)
  })
} else {
  Person.find({}).then(results => {
    console.info('phonebook: ');
    results.forEach(person => {
      console.info(`${person.name} ${person.number}`);
    })

    mongoose.connection.close()
  })
}