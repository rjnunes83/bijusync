// /apps/backend/models/Job.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modelo "Job" (Fila de Jobs persistente no PostgreSQL)
 * Cada job representa uma tarefa assíncrona do sistema.
 * Pronto para escalabilidade horizontal, histórico e reprocessamento.
 */
const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: { // Ex: 'sync-products-for-shop', 'delete-obsolete-products', etc.
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: { // Dados relevantes para o job (ex: {shopDomain, accessToken})
    type: DataTypes.JSONB,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
    defaultValue: 'pending',
    allowNull: false,
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  last_error: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // ------ OPCIONAIS ------
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    allowNull: false,
  },
  scheduled_for: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'jobs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Job;