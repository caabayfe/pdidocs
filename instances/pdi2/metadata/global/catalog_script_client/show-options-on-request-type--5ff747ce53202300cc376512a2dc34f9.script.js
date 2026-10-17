function onLoad() {
   //Type appropriate comment here, and begin script below
   
	//g_form.removeOption("request_type","create_group");
	var ga= new GlideAjax("KnowledgeAjax");
	ga.addParam("sysparm_type","getAceessOfRequestOptions");
	ga.getXMLAnswer(processResponse);

	function processResponse(response){
		var optionsData = JSON.parse(response);
		if(!optionsData.create){
			g_form.removeOption("request_type","create_group");
		}
		if(!optionsData.edit){
			g_form.removeOption("request_type","edit_group");
		}
	}
	
}
