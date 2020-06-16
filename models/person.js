const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error(error.message));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: [3, "Name has to be at least 3 characters long"],
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        const stripped = v.replace(/\D/g, "");
        return /\d{8,}/.test(stripped);
      },
      message: (props) =>
        `${props.value} is not a valid phone number - needs at least 8 digits`,
    },
  },
  id: Number,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
