module.exports = {
  isNumeric (string) {
    return !isNaN(parseFloat(string)) && isFinite(string)
  }
}
