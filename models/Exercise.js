const { model, Schema } = require("mongoose");

const exerciseSchema = new Schema({
  exerciseName: String,
  username: String,
  sets: [
    {
      weight: Number,
      reps: Number,
      createdAt: Number,
      notes: String,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = model("Exercise", exerciseSchema);
