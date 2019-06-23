const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const sendResponse = (code = 200, message = '') => {
    res.statusCode = code;
    res.end(message);
  };

  const pathname = url.parse(req.url).pathname.slice(1);

  if (pathname.includes('/') || pathname.includes('..')) {
    sendResponse(400, 'Nested paths are not allowed');
  }

  const filepath = path.join(__dirname, 'files', pathname);

  const removeFile = () => {
    fs.unlink(filepath, (error) => {
      if (!error) {
        sendResponse(200);
        return;
      }

      const {code} = error;

      if (code === 'ENOENT') {
        sendResponse(404, 'File not found');
      }

      sendResponse(500);
    });
  };

  switch (req.method) {
    case 'DELETE':
      removeFile();
      break;

    default:
      sendResponse(501, 'Not implemented');
  }

  res.on('close', () => {
    if (res.finished) return;
    stream.destroy();
  });
});

module.exports = server;
