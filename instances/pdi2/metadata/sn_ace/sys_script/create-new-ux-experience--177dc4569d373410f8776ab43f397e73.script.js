(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	try{
		var uxAppConfig = new sn_ace.ACEAppBuilderUtil().createExperience(current.name, current.url_path, 'home', current.sys_id, false, current);
	}catch(e){
		gs.addErrorMessage(e.toString());
	}

})(current, previous);
