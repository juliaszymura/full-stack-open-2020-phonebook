const mongoose = require("mongoose");

const generateId = () => {
  return Math.floor(Math.random() * (1000 - 1) + 1);
};

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://fullstack:${password}@cluster0-hc1c0.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  visible: Boolean,
  id: Number,
});

const Person = mongoose.model("Person", personSchema);

const createPerson = (name, number) => {
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const person = new Person({
    name,
    number,
    visible: true,
    id: generateId(),
  });

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
};

const showAllPersons = () => {
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  Person.find({}).then((result) => {
    result.forEach((person) => console.log(`${person.name} ${person.number}`));
    mongoose.connection.close();
  });
};

if (process.argv.length === 3) {
  showAllPersons();
} else if (process.argv.length === 5) {
  createPerson(process.argv[3], process.argv[4]);
} else {
  console.log("incorrect number of arguments");
  console.log("npm mongo.js <password> \t\t\tshow phonebook contents");
  console.log("npm mongo.js <password> <name> <number> \tadd person");
}
