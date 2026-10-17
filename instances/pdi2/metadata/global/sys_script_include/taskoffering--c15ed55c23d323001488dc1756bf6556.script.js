var TaskOffering = Class.create();
TaskOffering.prototype = Object.extendsObject(TaskOfferingSNC, {

	initialize: function() {
		TaskOfferingSNC.prototype.initialize.call(this);
    },

    type: 'TaskOffering'
});
