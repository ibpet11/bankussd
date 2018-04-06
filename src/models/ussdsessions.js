'use strict';
module.exports = (sequelize, DataTypes) => {
  const UssdSessions = sequelize.define('UssdSessions', {
    sessionid: DataTypes.STRING,
    msisdn: DataTypes.STRING,
    network: DataTypes.STRING,
    input: DataTypes.STRING,
    stage: DataTypes.INTEGER,
    vrc: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    agentNumber: DataTypes.STRING,
    referencemsg: DataTypes.STRING,
    agentName: DataTypes.STRING,
    vrcOwner: DataTypes.STRING,
    vinType: DataTypes.STRING,
    menulevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
  return UssdSessions;
};
