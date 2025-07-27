// backend/models/Shop.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // ajuste se o caminho do seu arquivo de conexão for diferente

const Shop = sequelize.define('Shop', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shopify_domain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  access_token: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'shops',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Shop;