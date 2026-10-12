insertLikeDocumentLinks();

function insertLikeDocumentLinks() {
	if(!current.message.group.nil() && !current.message.group.table.nil()) {
		var tableName = "";
		var documentName = current.message.group.name;
		var gr = new GlideRecord(current.message.group.table);
		gr.setWorkflow(false);
		gr.addQuery('sys_id', current.message.group.document);
		gr.query();
		if(gr.next()) {
			tableName = "View " + gr.getLabel();
			documentName = gr.getDisplayValue();
		}
		else {
			return; //we can't insert blank links
		}

		var url = "/nav_to.do?uri=";
		if(current.message.group.table == "kb_knowledge") {
			tableName = "View article";
			url += "kb_view.do?sys_kb_id=";
		}
		else
			url += current.message.group.table + ".do?sys_id=";
		url += current.message.group.document;

		template.print("<br />");
		template.print(tableName + ": " + "<a href='" + url + "'>" + documentName + "</a>");
		template.print("<br /><br />");
	}
}
