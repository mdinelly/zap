import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeIndex("Chatbots", "name");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeIndex("Chatbots", "name");
  }
};
