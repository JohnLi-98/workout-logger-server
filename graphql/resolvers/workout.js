const Workout = require("../../models/Workout");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Query: {
    async getAllWorkoutLogs(_, __, context) {
      const user = checkAuth(context);
      try {
        const allWorkouts = await Workout.find({
          user: user.id,
          username: user.username,
        }).sort({
          createdAt: -1,
        });
        if (allWorkouts) {
          return allWorkouts;
        } else {
          throw new Error("Unable to fetch workout logs");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async getWorkoutLog(_, { workoutId }, context) {
      const user = checkAuth(context);
      try {
        const workoutLog = await Workout.findOne({
          _id: workoutId,
          user: user.id,
          username: user.username,
        });
        if (workoutLog) {
          return workoutLog;
        } else {
          throw new Error("Log for this workout not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async getMostRecentWorkout(_, __, context) {
      const user = checkAuth(context);
      try {
        const workoutLog = Workout.findOne({
          user: user.id,
          username: user.username,
        }).sort({ createdAt: -1 });
        if (workoutLog) {
          return workoutLog;
        } else {
          throw new Error("Unable to fetch your most recent workout");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
