(function executeRule(current, previous /*null when async*/) {

	try {
		JSON.parse(current.template_json);
    } catch (e) {
        gs.addErrorMessage(gs.getMessage('Invalid Template JSON: {0}', e));
		current.setAbortAction(true);
		return;
    }
	
	try {
		var rootViewAttrsJSON = current.root_view_attrs_json;
		if(rootViewAttrsJSON)
			JSON.parse(rootViewAttrsJSON);
    } catch (e) {
        gs.addErrorMessage(gs.getMessage('Invalid Root View attribute JSON: {0}', e));
		current.setAbortAction(true);
		return;
    }	

})(current, previous);
