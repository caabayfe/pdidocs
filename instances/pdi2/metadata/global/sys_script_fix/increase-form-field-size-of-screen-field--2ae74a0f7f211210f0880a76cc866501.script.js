increaseScreenFieldMaxLength();

function increaseScreenFieldMaxLength() {
	var dict = new GlideRecord("sys_dictionary");
	dict.addQuery("name", "sys_sg_screen_field");
	dict.addQuery("element", "data_item_field_name");
	dict.query();
	while(dict.next() && dict.getValue("max_length") < 200) {
		dict.setValue("max_length", 200);
		dict.update();		
	}
}
