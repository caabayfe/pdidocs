increaseRedirectSourceFieldMaxLength();

function increaseRedirectSourceFieldMaxLength() {
	var dict = new GlideRecord("sys_dictionary");
	dict.setWorkflow(false);
	dict.addQuery("name", "sys_sg_redirect_dest_field");
	dict.addQuery("element", "source_field");
	dict.query()
	while(dict.next() && dict.getValue("max_length") !== "200") {
		dict.setValue("max_length", 200);
		dict.update();
		gs.info("updated sys_sg_redirect_dest_field.source_field max_length to 200");
		break;
	}
}
