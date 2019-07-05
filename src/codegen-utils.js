/**
 *
 *
 * @class CodeWriter
 */
class CodeWriter {
     /**
      * Creates an instance of CodeWriter.
      * 
      * @param {string} indentString
      * @constructor CodeWriter
      */
     constructor() {
          this.lines = []
          this.indentString = '  ' // default 2 spaces
          this.indentations = []
     }

     setIndentString(indentString) {
          this.indentString = indentString || '  ' // default 2 spaces
     }

     /**
      * Adds Indent spaces
      * 
      * @function indent
      */
     indent() {
          this.indentations.push(this.indentString)
     }

     /**
      * Adds Outdent spaces
      * 
      * @function outdent
      */
     outdent() {
          this.indentations.splice(this.indentations.length - 1, 1)
     }

     /**
      * Write a line
      * @param {string} line
      * @param {int} mIndent
      * @param {int} mOutdent
      * 
      * @function writeLine
      */
     writeLine(line, mIndent, mOutdent) {
          var i = 0;
          for (i = 0; i < mIndent; i++) {
               this.indent();
          }

          if (line) {
               this.lines.push(this.indentations.join('') + line)
          }

          for (i = 0; i < mOutdent; i++) {
               this.outdent();
          }
     }

     /**
      * Return as all string data
      * 
      * @function getData
      * @return {string}
      */
     getData() {
          return this.lines.join('\n')
     }

     /**
      * Return Indent String based on options
      * 
      * @function getIndentString
      * @param {Object} options
      * @return {string}
      */
     getIndentString(options) {
          if (options) {
               return options.useTab ?
                    "\t" :
                    options.indentSpaces.map(() => " ").join("");
          }
          return null;
     }

}

exports.CodeWriter = CodeWriter;