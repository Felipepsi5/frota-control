module.exports = (req, res, next) => {
  // Adicionar CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  // Adicionar timestamps automáticos
  if (req.method === 'POST' || req.method === 'PUT') {
    const now = new Date().toISOString();
    
    if (req.method === 'POST') {
      req.body.createdAt = now;
      req.body.updatedAt = now;
    } else if (req.method === 'PUT') {
      req.body.updatedAt = now;
    }
  }

  // Simular delay de rede (opcional)
  // setTimeout(() => {
  //   next();
  // }, 100);

  next();
};
