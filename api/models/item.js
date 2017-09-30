import Sequelize from 'sequelize';

const item = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  due_date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  paid_date: Sequelize.DATE,
  automatic: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  notes: Sequelize.TEXT,
  amount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  type_id: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
  }
}

export default item;