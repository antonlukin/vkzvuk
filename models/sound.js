module.exports = (sequelize, DataTypes) => {
  return sequelize.define('sound', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    vkid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: new DataTypes.STRING(64),
      allowNull: false,
    },
    original: {
      type: new DataTypes.STRING(256),
      allowNull: true,
    },
    visible: {
      type: new DataTypes.BOOLEAN,
      defaultValue: 1,
    },
  }, {
    sequelize,
    paranoid: true,
    tableName: 'sounds',
    indexes: [
      {
        unique: false,
        fields: ['vkid']
      }
    ]
  });
};