var ChangeScheduleRESTUtil = Class.create();

ChangeScheduleRESTUtil.PAYLOAD = ChangeScheduleRESTUtilSNC.PAYLOAD;

ChangeScheduleRESTUtil.prototype = Object.extendsObject(ChangeScheduleRESTUtilSNC, {

	initialize: function(chgMgtWorker) {
		ChangeScheduleRESTUtilSNC.prototype.initialize.call(this, chgMgtWorker);
	},
	
    type: 'ChangeScheduleRESTUtil'
});
