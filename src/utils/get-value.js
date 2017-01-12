// Gets value of a arbitrarily deeply nested value by key path
// @params {Object} obj - parent object
// @params {String} target - string of path `this.is.the.target`
// @returns value - returns null is value is not found, otherwise, returns value
function getValue(obj, target) {
  return target.split('.').reduce((o, x) => ((typeof o === 'undefined' || o === null) ? o : o[x]), obj);
}

export default getValue;
