var Class = {
  create: function() {
    return function() {
      this.initialize.apply(this, arguments);
    }
  }
}

Object.extend = function(destination, source) {
  for (property in source) {
    destination[property] = source[property];
  }
  return destination;
}

Object.extendsObject = function(destination, source) {
  destination = Object.clone(destination.prototype);
  
  for (property in source) {
    destination[property] = source[property];
  }
  return destination;
}

Object.clone = function(obj) {
  var clone = Class.create();
	
  for (property in obj) {
    clone[property] = obj[property];
  }
	
  return clone;
}
