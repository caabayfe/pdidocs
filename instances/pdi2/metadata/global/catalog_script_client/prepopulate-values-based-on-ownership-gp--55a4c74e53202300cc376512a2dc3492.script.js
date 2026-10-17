function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading || newValue == '') {
      return;
   }
	var ga= new GlideAjax("KnowledgeAjax");
	ga.addParam("sysparm_type","getOwnershipGrpDetails");
	ga.addParam("sysparm_group_id",g_form.getValue("ownership_group"));
	ga.getXMLAnswer(processResponse);

	function processResponse(response){
		var responseObj = JSON.parse(response);	
		g_form.setValue("name",responseObj.name);
		g_form.setValue("group_email",responseObj.email);
		g_form.setValue("manager",responseObj.manager);
		g_form.setValue("description",responseObj.description);
		g_form.setValue("group_members",responseObj.grpMembers);
		
		if(!responseObj.manager_edit){
			g_form.setMandatory("manager",false);
			g_form.setReadonly("manager",true);
		}
	}
	
	
}
