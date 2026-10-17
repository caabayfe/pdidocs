padCurrentCategory();

function padCurrentCategory() {
  var nm = new NumberManager();
  nm.padTableNumbers(current.category, current.maximum_digits);
}
