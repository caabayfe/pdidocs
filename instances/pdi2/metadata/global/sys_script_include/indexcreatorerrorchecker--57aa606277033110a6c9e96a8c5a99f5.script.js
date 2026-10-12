var IndexCreatorErrorChecker = Class.create();
IndexCreatorErrorChecker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	canCreate: function() {
		var table_name = this.getParameter("sysparm_table_name");
		var field_names = this.getParameter("sysparm_field_names");
		var access_method = this.getParameter("sysparm_access_method");
		var unique = this.getParameter("sysparm_unique");

		if (!table_name || (!field_names && access_method != "columnstore"))
			return;

		var field_names_list = [];
		if (field_names) {
			field_names_list = GlideStringUtil.split(field_names);
		}

		var id = new GlideIndexDescriptor(table_name, "index", field_names_list);
		if (access_method)
			id.setAccessMethod(access_method);

		if (unique)
			id.setUnique(true);
			
		var answer = {};
		answer.canCreate = id.canCreate();
		answer.errorCode = id.getErrorCode();
		return JSON.stringify(answer);
	},

    type: 'IndexCreatorErrorChecker'
});
