template.print("<p></p>Requested items:<br />");

var gr = new GlideRecord("sc_req_item");
gr.addQuery("request", current.sys_id);
gr.query();
while(gr.next()) {
	template.print(gr.number + ":  " + gr.cat_item.getDisplayValue() + ", Stage: " + gr.stage.getDisplayValue() + "<br />");
}
