function createKEClient() {
	if(g_form.modified) {
		getMessage("You have unsaved changes. Please save them to continue.", function(msg) {
			g_form.addErrorMessage(msg);
		});
	}else{
		g_form.submit('create_ke_article');
	}
}

if(typeof window == 'undefined')
	createKEServer(current);

function createKEServer(current){
	var map = new global.CSMTableMapUtil (current);
	map.findMapByName("problem_known_error_article");
	var targetURL = map.getTargetURL();
	if(targetURL) {
		action.setReturnURL(current);
		action.setRedirectURL(targetURL[0]);
	}
}
