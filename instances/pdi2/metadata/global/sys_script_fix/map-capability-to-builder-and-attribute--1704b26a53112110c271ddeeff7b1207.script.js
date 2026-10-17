// Update capability field for existing records for attributes.
var attributeGr = new GlideRecord("sys_one_extend_definition_attribute");

attributeGr.query();

while(attributeGr.next()) {
	attributeGr.setValue("capability", attributeGr.definition.capability);
	attributeGr.update();
}


// Update capability field for existing records for builder capability.
var builderCapGr = new GlideRecord("sys_one_extend_builder_capability");

builderCapGr.query();

while(builderCapGr.next()) {
	builderCapGr.setValue("capability", builderCapGr.definition.capability);
	builderCapGr.update();
}
