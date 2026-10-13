var NotifyConferenceUtils = Class.create();
NotifyConferenceUtils.prototype = Object.extendsObject(global.NotifyConferenceUtilsSNC, {
	initialize: function () {
		NotifyConferenceUtilsSNC.prototype.initialize.apply(this);
	},
	type: 'NotifyConferenceUtils'
});
