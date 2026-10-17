setVariableDisplayNameField();

function setVariableDisplayNameField() {
   var variable = current.source_catalog_variable.getDisplayValue().split("IO:")[1];
   var option = new GlideRecord("item_option_new");
   option.addQuery("sys_id", variable);
   option.query();
   if(option.next()) {
	 if(option.name.nil())
		current.source_variable = option.question_text;
	 else
		current.source_variable = option.name;
   }
}
