var RestStepFormUrlEncodedUtil = Class.create();
RestStepFormUrlEncodedUtil.prototype = {
    initialize: function() {
        this.parts = [];
    },
    addNameValue: function(name, value) {
        this.parts.push({
            name: name,
            value: value,
            order: this.parts.length
        });
    },
	
    build: function() {
        return JSON.stringify(this.parts);
    },
    type: 'RestStepFormUrlEncodedUtil'
};
