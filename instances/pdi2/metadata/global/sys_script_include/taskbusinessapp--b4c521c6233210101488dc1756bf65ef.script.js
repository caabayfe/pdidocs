var TaskBusinessApp = Class.create();
	TaskBusinessApp.prototype = Object.extendsObject(TaskBusinessAppSNC, {
		initialize: function() {
			TaskBusinessAppSNC.prototype.initialize.call(this);
		},

	type: 'TaskBusinessApp'
	});
