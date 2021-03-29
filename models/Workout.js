const { model, Schema } = require("mongoose");

const workoutSchema = new Schema({
  workoutName: String,
  username: String,
  createdAt: Number,
  exercises: [
    {
      exerciseName: String,
      sets: [
        {
          weight: Number,
          reps: Number,
          createdAt: Number,
          notes: String,
        },
      ],
    },
  ],
  notes: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = model("Workout", workoutSchema);
