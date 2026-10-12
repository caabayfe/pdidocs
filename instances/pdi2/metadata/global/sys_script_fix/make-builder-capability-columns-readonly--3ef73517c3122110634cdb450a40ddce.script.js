updateColumn(["active","default","builder_properties","definition"]);
function updateColumn(elements) {
	for (var i = 0; i < elements.length; i++) {
		var gr = new GlideRecord("sys_dictionary");
		gr.addQuery("name", "sys_one_extend_builder_capability");
		gr.addQuery("element", elements[i]);
		gr.query();
		if (gr.next()) {
			gr.setValue("read_only", "true");
			gr.update();
		}
	}
}
