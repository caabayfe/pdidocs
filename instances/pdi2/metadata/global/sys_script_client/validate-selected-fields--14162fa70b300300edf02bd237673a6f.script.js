function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //Validate seleted fields and remove invalid fields
	var ga = new GlideAjax("ValidateTextIndexFields");
	ga.addParam("sysparm_name", "getValidFields");
	ga.addParam("sysparm_field_names", newValue);
	ga.addParam("sysparm_tablename", g_form.getValue("table_name"));
	ga.getXMLAnswer(responseParser);

}
function responseParser(answer){
	if(answer.length != g_form.getValue("fields").length){
		g_form.setValue("fields", answer);
		g_form.addInfoMessage(getMessage("Non text fields and Dot walked fields are not allowed"));
	}
}
