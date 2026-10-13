var OnCallConstants = Class.create();
OnCallConstants.prototype = Object.extendsObject(OnCallConstantsSNC , {
    initialize: function() {
		OnCallConstantsSNC.prototype.initialize.call(this);
    },

    type: 'OnCallConstants'
});
