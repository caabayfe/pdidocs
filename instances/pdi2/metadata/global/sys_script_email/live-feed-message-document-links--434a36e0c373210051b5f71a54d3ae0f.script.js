insertDocumentLinks();

function insertDocumentLinks() {
	if(!current.group.nil() && !current.group.table.nil()) {
		var tableName = "";
		var documentName = current.group.name;
		var gr = new GlideRecord(current.group.table);
		if(!gr.isValid())
			return;
		gr.setWorkflow(false);
		gr.addQuery('sys_id', current.group.document);
		gr.query();
		if(gr.next()) {
			tableName = "View " + gr.getLabel();
			documentName = gr.getDisplayValue();
		}
		else {
			return; //we can't insert blank links
		}

		var url = "/nav_to.do?uri=";
		if(current.group.table == "kb_knowledge") {
			tableName = "View article";
			url += "kb_view.do?sys_kb_id=";
		}
		else
			url += current.group.table + ".do?sys_id=";
		url += current.group.document;

		template.print("<br />");
		template.print(tableName + ": " + "<a href='" + url + "'>" + documentName + "</a>");
		template.print("<br /><br />");
	}
	if(!current.group.nil()) {
		if(current.group.table.nil() || (!current.group.table.nil() && current.group.table != "kb_knowledge")) {
			var url = '/nav_to.do?uri=live_feed_launcher.do?sysparm_feed_type=group_feed%26sysparm_group_id=';
			url += current.group;

			template.print("<a href='" + url + "'>" + "View " + current.group.name + " Feed" + "</a>");
			template.print("<br /><br />");
		}
	}
}
