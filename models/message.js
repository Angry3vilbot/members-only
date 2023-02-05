const mongoose = require("mongoose")

const Schema = mongoose.Schema

const MessageSchema = new Schema({
    text: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, reqired: true },
    title: { type: String, reqired: true },
})

module.exports = mongoose.model("Message", MessageSchema, "users")