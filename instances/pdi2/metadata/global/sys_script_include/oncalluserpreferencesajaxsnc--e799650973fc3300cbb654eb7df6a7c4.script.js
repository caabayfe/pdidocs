var OnCallUserPreferencesAjaxSNC = Class.create();
OnCallUserPreferencesAjaxSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getHighestOrderContactAttemptAjax: function () {
		var ocup = new OnCallUserPreferences();
		return ocup.getHighestOrderContactAttempt(this.getParameter("sysparm_user_preference_sys_id"), true);
	},

	type: 'OnCallUserPreferencesAjaxSNC'
});
