'use strict';
module.exports = (sequelize, DataTypes) => {
  const UssdSessions = sequelize.define('UssdSessions', {
    sessionid: DataTypes.STRING,
    msisdn: DataTypes.STRING,
    network: DataTypes.STRING,
    input: DataTypes.STRING,
    stage: DataTypes.INTEGER,
    vrc: DataTypes.INTEGER,
    amount: DataTypes.FLOAT,
    menulevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
  return UssdSessions;
};
