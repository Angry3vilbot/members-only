const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    password: { type: String, reqired: true },
    email: { type: String, reqired: true },
    membership: { type: Boolean, required: true }
})

module.exports = mongoose.model("User", UserSchema, "users")