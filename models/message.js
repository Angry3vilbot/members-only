const mongoose = require("mongoose")
const { DateTime } = require("luxon")

const Schema = mongoose.Schema

const MessageSchema = new Schema({
    text: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, reqired: true },
    title: { type: String, reqired: true },
})

MessageSchema.virtual("date_formatted").get(function () {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED)
})

module.exports = mongoose.model("Message", MessageSchema, "messages")