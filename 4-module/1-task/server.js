const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  const regex = /\//ig;
  const folderNesting = req.url.match(regex);

  if (folderNesting.length > 1) {
    res.statusCode = 400;
    res.end();
  }

  const returnFile = () => {
    const stream = fs.createReadStream(filepath);
    stream.pipe(res);
    stream.on('error', () => {
      res.statusCode = 404;
      res.end('Not found');
    });
  };

  switch (req.method) {
    case 'GET':
      returnFile();
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
