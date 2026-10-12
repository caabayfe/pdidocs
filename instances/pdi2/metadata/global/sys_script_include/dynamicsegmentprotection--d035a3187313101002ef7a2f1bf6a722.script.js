var DynamicSegmentProtection = Class.create();

DynamicSegmentProtection.prototype = {
    initialize: function() {
    },

	//define if static/dynamic mode
	defineConfigurationMode: function(className, formScreenId) {
		var dynamicFormSegmentTable = "sys_sg_dynamic_form_segment";
		var formScreenColumnName = "form";
		var dynamicMode = "dynamic";
		var staticMode = "static";
		
		if(className == dynamicFormSegmentTable)
			return dynamicMode;
		
		var formSegmentGR = new GlideRecord(dynamicFormSegmentTable);
		formSegmentGR.addQuery(formScreenColumnName, formScreenId);
		formSegmentGR.query();
		if(formSegmentGR.next())
			return dynamicMode;

		return staticMode;
	},
	
	checkStaticSegment: function(staticSegmentGR, index, messagePrefix){
		var isSuccessful = true;
		if(!staticSegmentGR.header_view_config) {
			gs.addErrorMessage(
				messagePrefix + " "+
				gs.getMessage("The field \"Header card\" is empty. It must be set to work together with a dynamic segment"));
			
			isSuccessful = false;
		}

        if(staticSegmentGR.is_sticky && index != 0) {
			gs.addErrorMessage(gs.getMessage(
				messagePrefix + " "+
				"The property \"Sticky\" should be set to false. Only the first static segment may be marked as sticky"));
			
			isSuccessful = false;
		}
		
		return isSuccessful;
   },
	
    type: 'DynamicSegmentProtection'
};
