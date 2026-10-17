template.print("<br />");  
var gr = new GlideRecord("kb_knowledge");
gr.addQuery('source', current.sys_id);
gr.query();
while (gr.next()) {
	var link = new GlideSubstituteURL().generateURL(gr, '');
	var title = gr.number;
	if (gr.short_description != '') {
		title+= " - " + gr.short_description;
	}
	
	var anchor = "<a href='" + link +"'>" + title + "</a>";
	template.print(anchor + "<br />");
}
