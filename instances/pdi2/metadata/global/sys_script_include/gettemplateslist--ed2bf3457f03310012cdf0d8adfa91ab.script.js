var GetTemplatesList = Class.create();

GetTemplatesList.getGlideRecord = function(table, templateBarOnly) {
	var encQuery = "table=" + table;
	encQuery += "^active=true";
	encQuery += "^global=true";
	encQuery += "^ORuser=javascript:gs.getUserID()";
	encQuery += "^ORgroups=javascript:getMyGroups()";
	encQuery += "^ORrolesIN" + GlideSession.get().getRoles();

	var gr = new GlideRecord("sys_template");
	gr.addEncodedQuery(encQuery);
	// show_on_template_bar is considered true if either true *or* null
	if (templateBarOnly)
		gr.addQuery('show_on_template_bar', 1).addOrCondition('show_on_template_bar', null);
	gr.orderBy("name");
	gr.setWorkflow(false);
	gr.query();
	return gr;
};

GetTemplatesList.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	returnList: function() {
		var table = this.getParameter("sysparm_table_name");
		var templateBarOnly = this.getParameter("sysparm_template_bar_only") + "";
		var tt = GetTemplatesList.getGlideRecord(table, templateBarOnly === 'true');
		while (tt.nextRecord()) {
			var template = this.newItem("template");
			template.setAttribute("name", tt.getValue('name'));
			template.setAttribute("sys_id", tt.getUniqueValue());
			template.setAttribute("application", tt.getValue('sys_scope'));
			template.setAttribute("show_on_template_bar", tt.getValue("show_on_template_bar"));
		}
	},

	type: "GetTemplatesList"
});
