// backend/models/Shop.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // ajuste se o caminho do seu arquivo de conexão for diferente

// Modela a loja Shopify conectada ao sistema
const Shop = sequelize.define('Shop', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shopify_domain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-zA-Z0-9-]+\.myshopify\.com$/ // Garante domínio válido do Shopify
    }
  },
  access_token: {
    type: DataTypes.STRING,
    allowNull: false
    // Nunca exponha o token em logs ou APIs!
  }
}, {
  tableName: 'shop',     // Nome exato no banco
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  freezeTableName: true, // Nunca pluraliza automaticamente
  underscored: true      // Campos snake_case
});

export default Shop;