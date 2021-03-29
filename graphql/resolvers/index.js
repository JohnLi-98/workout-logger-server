const userResolvers = require("./users");
const setResolvers = require("./set");
const exerciseResolvers = require("./exercise");
const workoutResolvers = require("./workout");

module.exports = {
  Query: {
    ...exerciseResolvers.Query,
    ...workoutResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...setResolvers.Mutation,
    ...exerciseResolvers.Mutation,
  },
};
