var getFeatureAccessEnabledStatus = Class.create();
getFeatureAccessEnabledStatus.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getCheckboxStatus: function () {
		var gr = new GlideRecord("sys_hub_resource_filter_rule");
		// DEF0310491 - ensure we make sure user can access table before querying
		if(gr.canRead()){
			var allUISectionsActive = true;
			gr.addQuery("resource.name", "All UI Elements");
			gr.query();
			while(gr.next()) {
				if (gr.getValue("active") == 0) {
					allUISectionsActive	= false;
					return allUISectionsActive;
				}
			}
		}
		
	},
    type: 'getFeatureAccessEnabledStatus'
});
