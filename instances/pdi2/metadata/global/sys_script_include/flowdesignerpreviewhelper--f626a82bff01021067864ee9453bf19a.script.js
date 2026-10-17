var FlowDesignerPreviewHelper = Class.create();
FlowDesignerPreviewHelper.prototype = {
    initialize: function() {
    },

    type: 'FlowDesignerPreviewHelper'
};

FlowDesignerPreviewHelper.getIntegerPropertyValue = function(propertyName, defaultValue) {
    var propertyValue = defaultValue;
    var value = gs.getProperty(propertyName);
    if (value) {
        try {
            var intValue = parseInt(value + '');
            if (Number.isInteger(intValue)) {
                propertyValue = intValue;
            }
        } catch (e) {
        }
    }
    return propertyValue;
};

FlowDesignerPreviewHelper.deletePreviewFlows = function(debug) {
	var isText2FlowPluginActive = GlidePluginManager().isActive('com.sn.text2flow');
    if (isText2FlowPluginActive) {
		FlowDesignerPreviewHelper.processDeletePreviewFlows(debug);
	}
};

FlowDesignerPreviewHelper.processDeletePreviewFlows = function(debug) {
    var TWO_DAYS_IN_HOURS = 48;
	var totalDeleteCount = FlowDesignerPreviewHelper.getIntegerPropertyValue("sn_flow_designer.preview_delete_count", 10);
	var waitPeriod = FlowDesignerPreviewHelper.getIntegerPropertyValue("sn_flow_designer.preview_wait_period", TWO_DAYS_IN_HOURS);
	var now_GR = new GlideRecord('sys_hub_flow'); 
	now_GR.initialize(); 
	var substatusExists = now_GR.isValidField("substatus");
	if (substatusExists) {
		var fGr = new GlideRecord("sys_hub_flow");
		fGr.addQuery("substatus", "preview");
		fGr.addEncodedQuery("sys_created_onRELATIVELT@hour@ago@" + waitPeriod);
		fGr.orderBy("sys_created_on");
		fGr.setLimit(totalDeleteCount);
		fGr.query();
		while (fGr.next()) {
			if (debug) {
				gs.debug("Flow Preview Cleanup: Deleting sys_hub_flow record: " + fGr.getValue("name") + " created: " + fGr.getValue("sys_created_on") );
			} else {
				// need to call deleteRecord() to cascade deleting related records
				fGr.deleteRecord();
			}
		}
	}
}
