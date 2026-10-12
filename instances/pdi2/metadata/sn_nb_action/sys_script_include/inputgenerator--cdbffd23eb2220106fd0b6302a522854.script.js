var InputGenerator = Class.create();
InputGenerator.prototype = Object.extendsObject(sn_nb_action.InputGeneratorImpl, {
    initialize: function() {
		InputGeneratorImpl.prototype.initialize.call(this);
    },

    type: 'InputGenerator'
});
