require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const Person = require("./models/person");

const app = express();
morgan.token("payload", (request) => JSON.stringify(request.body));

app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :payload"
  )
);

const personsRoute = "/api/persons";
const infoRoute = "/info";

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server v0.1.0 running on port ${PORT}`);
});

app.get(personsRoute, (request, response) => {
  Person.find({}).then((persons) => response.json(persons));
});

app.get(personsRoute.concat("/:id"), (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).send({ error: "not found" });
      }
    })
    .catch((error) => next(error));
});

app.get(infoRoute, (request, response) => {
  Person.countDocuments().then((result) => {
    const payload = `Phonebook has info for ${result} people.<br><br>${Date()}`;
    response.send(payload);
  });
});

app.delete(personsRoute.concat("/:id"), (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.sendStatus(204))
    .catch((error) => next(error));
});

app.post(personsRoute, (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savedPerson) => response.status(201).json(savedPerson))
    .catch((error) => next(error));
});

app.put(personsRoute.concat("/:id"), (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
  })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformed id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "MongoError") {
    return response.status(409).json({ error: error.errmsg });
  }
  next(error);
};
app.use(errorHandler);
