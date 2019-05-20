/**
 * CodeWriter
 */
class CodeWriter {
  /**
   * @constructor
   */
  constructor (indentString) {
    /** @member {Array.<string>} lines */
    this.lines = []

    /** @member {string} indentString */
    this.indentString = indentString || '  ' // default 2 spaces

    /** @member {Array.<string>} indentations */
    this.indentations = []
  }

  /**
   * Indent
   */
  indent () {
    this.indentations.push(this.indentString)
  }

  /**
   * Outdent
   */
  outdent () {
    this.indentations.splice(this.indentations.length - 1, 1)
  }

  /**
   * Write a line
   * @param {string} line
   */
  writeLine (line) {
    if (line) {
      this.lines.push(this.indentations.join('') + line)
    } else {
      this.lines.push('')
    }
  }

  /**
   * Return as all string data
   * @return {string}
   */
  getData () {
    return this.lines.join('\n')
  }

}

exports.CodeWriter = CodeWriter;
