if (!pm.isZboot())
	updateVARenderTypeCalculatedField();

function updateVARenderTypeCalculatedField () {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "catalog_item_analytics");
	gr.addQuery("element", "conversational_render_type");
	gr.query();
	if (gr.next()) {
		if(gr.getValue("virtual")== true){
			gr.setValue("virtual", false);
			gr.update();
		}
	}
}
