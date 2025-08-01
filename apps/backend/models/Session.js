// /apps/backend/models/Session.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modelo "Session" (Sessão de Autenticação Shopify)
 * Mapeia a tabela "session" usada para autenticação, OAuth e webhooks.
 * Garante compatibilidade com o padrão da Shopify e multiusuário.
 */
const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.STRING, // Normalmente string UUID ou custom session ID da Shopify
    primaryKey: true,
  },
  shop: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  scope: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountOwner: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  locale: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  collaborator: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
}, {
  tableName: 'session', // Nome exato da tabela no banco
  timestamps: false,    // Se quiser timestamps, pode ativar
  freezeTableName: true,
  underscored: false,   // Shopify costuma usar camelCase
});

export default Session; 