const { model, Schema, set } = require("mongoose");

const setSchema = new Schema({
  weight: Number,
  reps: Number,
  createdAt: Number,
  notes: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = model("Set", setSchema);
