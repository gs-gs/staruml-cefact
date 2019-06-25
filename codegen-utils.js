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
     writeLine(line, mIndent, mOutdent) {
          var i = 0;
          for (i = 0; i < mIndent; i++) {
               this.indent();
          }
          if (line) {
               this.lines.push(this.indentations.join('') + line)
          } else {
               this.lines.push('')
          }
          for (i = 0; i < mOutdent; i++) {
               this.outdent();
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
   