

/**
 * Middleware de autenticação para APIs internas.
 * Garante que apenas chamadas do frontend autorizado podem acessar rotas críticas.
 */

export const verifyInternalApi = (req, res, next) => {
  const secret = req.headers['x-internal-api-secret'];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    console.warn(`[AUTH] Tentativa de acesso não autorizado à API interna do IP: ${req.ip}`);
    return res.status(403).json({ error: 'Acesso não autorizado.' });
  }
  next();
};