var RecordFieldGetter = Class.create();
RecordFieldGetter.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getValue: function() {		 
		var table = this.getParameter("sysparm_table");		
		var sys_id = this.getParameter("sysparm_sys_id");
		var fieldName = this.getParameter("sysparm_field_name");
		var gr = new GlideRecord(table);
		if (!gr.get(sys_id))
			return '';
		if (!gr.canRead())
			return '';
		if (!gr[fieldName].canRead())
			return '';
		return gr.getValue(fieldName) || '';
	},
	
    type: 'RecordFieldGetter'
});
