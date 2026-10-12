var SMGlobal = Class.create();
SMGlobal.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    isPwd2Field: function() {
		var table = this.getParameter("sysparm_table");
		var column = this.getParameter("sysparm_column");
		return this.isPwd2FieldHelper(table, column);
	},
	
	isPwd2FieldHelper: function(table, column) {
		var tableUtil = new TableUtils(table);
		var tableArr = j2js(tableUtil.getTables());
		
		var gr = new GlideRecordSecure("sys_dictionary");
		gr.addQuery("name" , "IN" , tableArr);
		gr.addQuery("element", column);
		gr.query();
		
		if (gr.next() && gr.getValue("internal_type") == "password2")
			return true;
		return false;
	},
	type: 'SMGlobal'
});
