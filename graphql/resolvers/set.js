const { UserInputError } = require("apollo-server");

const {
  validateLogSetInput,
  validateEditSetInput,
} = require("../../utils/validators");
const checkAuth = require("../../utils/check-auth");
const Set = require("../../models/Set");
const Exercise = require("../../models/Exercise");
const Workout = require("../../models/Workout");
const exercise = require("./exercise");

module.exports = {
  Mutation: {
    /**
     * Validate set input and authenticates user before inserting it into the Exercise and Workout
     * collections in MongoDB.
     */
    async logSet(
      _,
      { logSetInput: { exerciseName, weight, reps, notes } },
      context
    ) {
      const { errors, valid } = validateLogSetInput(exerciseName, weight, reps);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = checkAuth(context);

      const exerciseLog = await getExerciseLog(exerciseName, user);
      const workoutLog = await getWorkoutLog(
        user,
        exerciseLog.id,
        exerciseName
      );

      const set = new Set({
        weight,
        reps,
        createdAt: Date.now(),
        notes,
      });
      await addSetToExerciseLog(exerciseLog, set);
      await addSetToWorkoutLog(workoutLog, exerciseLog.id, exerciseName, set);
      return set;
    },

    async deleteSet(_, { exerciseId, setId }, context) {
      const user = checkAuth(context);
      await deleteFromExercise(exerciseId, user, setId);
      await deleteFromWorkout(user, exerciseId, setId);
      return "Set deleted successfully";
    },

    async editSet(
      _,
      { editSetInput: { exerciseId, setId, weight, reps, notes } },
      context
    ) {
      const { errors, valid } = validateEditSetInput(weight, reps);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = checkAuth(context);
      await editExerciseSet(user, setId, weight, reps, notes);
      await editWorkoutSet(user, setId, weight, reps, notes, exerciseId);
      return "Set edited succesfully";
    },
  },
};

/* --- LOG SET RESOLVER FUNCTIONS --- */
const getExerciseLog = async (exerciseName, user) => {
  let exerciseLog = await Exercise.findOne({
    exerciseName,
    user: user.id,
  });
  if (!exerciseLog) {
    exerciseLog = await createExerciseLog(user, exerciseName);
  }
  return exerciseLog;
};

// Create a new Exercise document in MongoDB collection - Only invoked if exercise doesn't already exist.
const createExerciseLog = async (user, exerciseName) => {
  const newExercise = new Exercise({
    user: user.id,
    exerciseName,
    username: user.username,
  });
  const exerciseLog = await newExercise.save();
  return exerciseLog;
};

const addSetToExerciseLog = async (exerciseLog, set) => {
  exerciseLog.sets.unshift(set);
  return await exerciseLog.save();
};

const getWorkoutLog = async (user, exerciseId, exerciseName) => {
  let workoutLog = await Workout.findOne({ user: user.id }).sort({
    createdAt: -1,
  });

  // Create new Workout document if most recent is expired (3 hours from when workoutLog was created) or not found.
  const expiredWorkout =
    workoutLog && Date.now() > workoutLog.createdAt + 14400000;
  if (!workoutLog || expiredWorkout) {
    workoutLog = await createWorkoutLog(user, exerciseId, exerciseName);
  }
  return workoutLog;
};
// Create a new Workout document in MongoDB collection - Only invoked if workout doesn't already exist.
const createWorkoutLog = async (user, exerciseId, exerciseName) => {
  const newWorkout = new Workout({
    user: user.id,
    username: user.username,
    createdAt: Date.now(),
    exercises: [
      {
        _id: exerciseId,
        exerciseName,
      },
    ],
  });
  const workoutLog = await newWorkout.save();
  return workoutLog;
};

const addSetToWorkoutLog = async (
  workoutLog,
  exerciseId,
  exerciseName,
  set
) => {
  const exerciseExists = workoutLog.exercises.some(
    (exercise) => exercise.id === exerciseId
  );
  if (!exerciseExists) {
    workoutLog.exercises.unshift({
      _id: exerciseId,
      exerciseName,
    });
  }

  const exercise = workoutLog.exercises.find(
    (exercise) => exercise.id === exerciseId
  );
  exercise.sets.push(set);
  workoutLog.exercises.sort((x, y) => {
    return x == exercise ? -1 : y == exercise ? 1 : 0;
  });
  await workoutLog.save();
};

/* --- DELETE SET RESOLVER FUNCTIONS --- */
const deleteFromExercise = async (exerciseId, user, setId) => {
  const exerciseLog = await Exercise.findOne({
    _id: exerciseId,
    user: user.id,
  });
  if (exerciseLog) {
    const setIndex = exerciseLog.sets.findIndex((set) => set.id === setId);
    if (setIndex >= 0) {
      exerciseLog.sets.splice(setIndex, 1);
      await exerciseLog.save();
    } else {
      throw new Error("Set not found");
    }
  } else {
    throw new Error("Exercise log not found");
  }
};

const deleteFromWorkout = async (user, exerciseId, setId) => {
  const workoutLog = await Workout.findOne({
    user: user.id,
    "exercises._id": exerciseId,
    "exercises.sets._id": setId,
  });
  if (workoutLog) {
    ("");
    const exercise = workoutLog.exercises.find(
      (exercise) => exercise.id === exerciseId
    );
    const setIndex = exercise.sets.findIndex((set) => set.id === setId);
    exercise.sets.splice(setIndex, 1);
    await workoutLog.save();
  } else {
    throw new Error("Workout log not found");
  }
};

/* --- EDIT SET RESOLVER FUNCTIONS --- */
const editExerciseSet = async (user, setId, weight, reps, notes) => {
  try {
    await Exercise.updateOne(
      {
        user: user.id,
        "sets._id": setId,
      },
      {
        "sets.$.weight": weight,
        "sets.$.reps": reps,
        "sets.$.notes": notes,
      }
    ).exec();
  } catch (err) {
    throw new Error(err);
  }
};

const editWorkoutSet = async (user, setId, weight, reps, notes, exerciseId) => {
  try {
    await Workout.updateOne(
      {
        user: user.id,
        "exercises.sets._id": setId,
      },
      {
        "exercises.$[exercise].sets.$[set].weight": weight,
        "exercises.$[exercise].sets.$[set].reps": reps,
        "exercises.$[exercise].sets.$[set].notes": notes,
      },
      {
        arrayFilters: [
          {
            "exercise._id": exerciseId,
          },
          {
            "set._id": setId,
          },
        ],
      }
    ).exec();
  } catch (err) {
    throw new Error(err);
  }
};
