function removeLocationAttribute() {
	var locationColumn = new GlideRecord("sys_dictionary");
	locationColumn.setLimit(1);
	locationColumn.addQuery("name", "sys_sg_location_item_stream");
	locationColumn.addQuery("element", "location");
	locationColumn.addQuery("internal_type", "field_name");
	locationColumn.addQuery("attributes", "allow_references=true,reference_types=cmn_location");
	locationColumn.query();
	
	if(!locationColumn.next())
		return;
	
	locationColumn.setValue("attributes", "allow_references=true");
	locationColumn.update();
}

removeLocationAttribute();
