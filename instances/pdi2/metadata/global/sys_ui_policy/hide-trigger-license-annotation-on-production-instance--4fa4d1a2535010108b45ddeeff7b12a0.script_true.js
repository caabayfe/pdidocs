function onCondition() {
	var ga = new GlideAjax("PADClientUtil");
	ga.addParam("sysparm_name", "isProductionInstance");
	ga.getXMLAnswer(setAnnotationVisible);
	
	function setAnnotationVisible(answer) {
		var production = answer.toLowerCase() == "true" || answer == "1";
		if (production) {
			var e = document.getElementById("trigger_license_info_annotation");
			if (e) 
				e.up().hide();
		}
	}
}
