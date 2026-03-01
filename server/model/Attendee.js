let mongoose = require("mongoose");

let attendeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    DOB: { type: String, required: true, index: true }, // Indexed for faster duplicate detection
    level: { type: String, required: true },
    dept: { type: String, required: true },
    phone: { type: String, required: true, index: true }, // Indexed for faster duplicate detection
    dateregistered: { type: Date, required: true, default: Date.now },
    noofattendance: { type: Number, required: true, default: 1 },
    datesofattendance: {
      type: [Date],
      required: true,
      default: function () {
        return [Date.now()];
      },
    },
  },
  { timestamps: true }
);

let Attendee = mongoose.model("Attendees", attendeeSchema);

module.exports = Attendee;
