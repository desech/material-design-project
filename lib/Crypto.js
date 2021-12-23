const nanoid = require('nanoid')

module.exports = {
  generateElementRef () {
    return 'e0' + this.generateSmallID()
  },

  generateSmallID () {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    return nanoid.customAlphabet(alphabet, 6)()
  }
}
