const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    const chunkLength = chunk.length;

    if (this.limit - chunkLength >= 0) {
      callback(null, chunk);
      this.limit -= chunkLength;
    } else {
      this.destroy(new LimitExceededError());
    }
  }
}

module.exports = LimitSizeStream;
