var ATFCloudUserInvalid = Class.create();
ATFCloudUserInvalid.prototype = {
    initialize: function() {
    },
	
	isInvalidCloudUser: function(gr) {
		var isConcurrentSessionLimitActive = gr.isValidField("limit_concurrent_sessions") && gr.limit_concurrent_sessions == true;

		var isCloudUserInvalid = (gs.nil(gr.getValue("active")) || gr.active == false || gr.locked_out == true || gr.internal_integration_user == true || gr.web_service_access_only == true || gr.password_needs_reset == true || (isConcurrentSessionLimitActive));

		return isCloudUserInvalid;
	},
    type: 'ATFCloudUserInvalid'
};
