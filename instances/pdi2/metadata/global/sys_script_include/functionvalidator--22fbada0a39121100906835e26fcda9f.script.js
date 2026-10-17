var FunctionValidator = Class.create();
	FunctionValidator.prototype = {
    initialize: function() {},
    validateFunction: function(si, fn) {
        var siObject = new si();
        var result = si != null && typeof siObject[fn] == "function";
		return result;
      
    },

    type: 'FunctionValidator'
};
