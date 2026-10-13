var OnCallUserPreferences = Class.create();
OnCallUserPreferences.prototype = Object.extendsObject(OnCallUserPreferencesSNC, {
	initialize: function () {
		OnCallUserPreferencesSNC.prototype.initialize.call(this);
	},

	type: 'OnCallUserPreferences'
});
