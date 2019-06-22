const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  const ONE_MB_IN_BYTES = 1e+6;

  const sendResponse = (code = 500, endMessage = '') => {
    res.statusCode = code;
    res.end(endMessage);
  };

  const removeFile = () => {
    fs.unlinkSync(filepath);
  };

  const tryToWriteFile = () => {
    const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
    const limitedStream = new LimitSizeStream({limit: ONE_MB_IN_BYTES});

    req
        .pipe(limitedStream)
        .on('error', ({code}) => {
          if (code === 'LIMIT_EXCEEDED') sendResponse(413, 'File size is too big');
        })
        .pipe(writeStream)
        .on('error', ({code}) => {
          if (code === 'EEXIST') sendResponse(409);
        })
        .on('close', () => {
          sendResponse(201, 'File created');
        });

    res.on('close', () => {
      if (res.finished) return;
      writeStream.destroy();
      removeFile();
    });
  };

  switch (req.method) {
    case 'POST':
      tryToWriteFile();
      break;

    default:
      sendResponse(501, 'Not implemented');
  }
});

module.exports = server;
