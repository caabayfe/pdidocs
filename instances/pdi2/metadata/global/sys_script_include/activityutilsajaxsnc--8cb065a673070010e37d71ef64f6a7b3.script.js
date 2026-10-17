var ActivityUtilsAjaxSNC = Class.create();
ActivityUtilsAjaxSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getTemplateFieldSourceTable: function() {
		var templateId = this.getParameter("sysparm_templateId");
		var type = this.getParameter("sysparm_type");
		if(!templateId || !type)return;
		var templateGr = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_TYPE_TEMPLATE);
		templateGr.get(templateId);
		
		if(templateGr.isValidRecord() && templateGr.canRead() && !gs.nil(templateGr.activity_type)) {
			if(type == ActivityConstants.TYPE_ACTIVITY_SOURCE_TABLE && !gs.nil(templateGr.activity_type.activity_type)) {
				return templateGr.activity_type.activity_type.activity_source_table+"";
			}
			else if(type == ActivityConstants.TYPE_ACTIVITY_GROUP_TABLE && !gs.nil(templateGr.activity_type.subobject)) {
				return templateGr.activity_type.subobject.table_name+"";
			}
		}
		return;
	},
	
	getSourceMappingFieldDefault: function() {
		var result = "";
		var sourceTable = this.getParameter("sysparm_source_table");
		if (sourceTable == ActivityConstants.TABLE_ACTIVITY) 
			result =  "actor_id";
		return result;
	},
	
	isDateTypeField: function() {
		var table = this.getParameter("sysparm_table");
		var field = this.getParameter("sysparm_field");
		if(!table || !field)return;
		
		var gr = new GlideRecord(table);
		gr.setLimit(1);
		gr.query();
		if(gr.next()) {
			var type = gr.getElement(field).getED().getInternalType();
			return (type == "glide_date_time" || type == "glide_date") ? true : false;
		}
		return false;
	},
	
    type: 'ActivityUtilsAjaxSNC'
});
