import Sequelize from 'sequelize';

const type = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  default_value: Sequelize.DECIMAL(10, 2),
  repeat_type: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  description: Sequelize.TEXT,
  notes: Sequelize.TEXT,
  url: Sequelize.STRING,
}

export default type;