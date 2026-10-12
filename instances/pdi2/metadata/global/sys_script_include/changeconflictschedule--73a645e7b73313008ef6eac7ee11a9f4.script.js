var ChangeConflictSchedule = Class.create();
ChangeConflictSchedule.prototype = Object.extendsObject(ChangeConflictScheduleSNC, {

	initialize: function() {
		ChangeConflictScheduleSNC.prototype.initialize.apply(this, arguments);
	},

    type: 'ChangeConflictSchedule'
});
