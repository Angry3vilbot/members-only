const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    password: { type: String, reqired: true },
    email: { type: String, reqired: true },
    membership: { type: Boolean, required: true },
    isAdmin: { type: Boolean, required: false }
})

UserSchema.virtual("full_name").get(function () {
    return `${this.surname} ${this.name}`
})

module.exports = mongoose.model("User", UserSchema, "users")