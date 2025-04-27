// Servidor simplificado para Render
const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

// Ruta básica para verificar que el servidor está funcionando
app.get('/health', (req, res) => {
  res.send('Server is running');
});

// Redirigir todas las demás solicitudes al servidor principal
app.all('*', (req, res) => {
  res.send('Servidor de verificación funcionando. El servidor principal debería iniciarse pronto.');
});

// Iniciar el servidor en el puerto especificado
const server = app.listen(port, () => {
  console.log(`Servidor de verificación iniciado en el puerto ${port}`);
});

// Configurar timeouts para mantener conexiones vivas
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
