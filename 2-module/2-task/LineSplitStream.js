const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    const {encoding} = options;

    this.setDefaultEncoding(encoding);
    this.chunkRest = '';
  }

  _transform(chunk, encoding, callback) {
    const separatedChunk = `${this.chunkRest}${chunk}`.split(os.EOL);
    this.chunkRest = separatedChunk.pop();

    separatedChunk.forEach((chunk) => {
      this.push(chunk);
    });

    callback();
  }

  _flush(callback) {
    callback(null, this.chunkRest);
  }
}

module.exports = LineSplitStream;
