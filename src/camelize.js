/**
 * @function convertToString
 * @param {string} input
 * @description util function to convert the input to string type
 */
function convertToString(input) {

    if (input) {

         if (typeof input === "string") {

              return input;
         }

         return String(input);
    }
    return '';
}

/**
 * @function toWords
 * @param {string} input
 * @description convert string to words
 */
function toWords(input) {

    input = convertToString(input);

    var regex = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;

    return input.match(regex);

}

/**
 * @function toCamelCase
 * @param {Array} inputArray
 * @description convert the input array to camel case
 */
function toCamelCase(inputArray) {

    let result = "";

    for (let i = 0, len = inputArray.length; i < len; i++) {

         let currentStr = inputArray[i];

         let tempStr = currentStr.toLowerCase();

         if (i != 0) {

              /* convert first letter to upper case (the word is in lowercase)  */
              tempStr = tempStr.substr(0, 1).toUpperCase() + tempStr.substr(1);

         }

         result += tempStr;

    }

    return result;
}

/**
 * @function toCamelCaseString
 * @param {string} input
 * @description this function call all other functions
 */
function toCamelCaseString(input) {

    let words = toWords(input);

    return toCamelCase(words);

}
module.exports.toCamelCaseString=toCamelCaseString;