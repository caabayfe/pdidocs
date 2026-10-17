var MobileLoginHelper = Class.create();

MobileLoginHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	isPublic: function() {
		return true;
	},

    setStartingPageUrl: function() {
		var session = gs.getSession();
		var startingUrl = session.getProperty("starting_page");
		if (GlideStringUtil.nil(startingUrl)) {
			startingUrl = session.getProperty("nav_to");
			session.putProperty("starting_page", startingUrl);
		}
		
		var result = this.newItem("result");
		gs.log("Starting page has been set to:", startingUrl);
		result.setAttribute("starting_page", startingUrl);
	},

    type: 'MobileLoginHelper'
});
