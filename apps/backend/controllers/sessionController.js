

import SessionService from '../services/sessionService.js';

/**
 * Controller para armazenar uma sessão Shopify
 */
export const storeSession = async (req, res, next) => {
  try {
    await SessionService.storeSession(req.body);
    res.status(201).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Controller para carregar uma sessão Shopify por ID
 */
export const loadSession = async (req, res, next) => {
  try {
    const session = await SessionService.loadSession(req.params.id);
    if (session) {
      res.json(session);
    } else {
      res.status(404).send();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Controller para deletar uma sessão Shopify por ID
 */
export const deleteSession = async (req, res, next) => {
  try {
    await SessionService.deleteSession(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};