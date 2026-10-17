(function executeRule(current, previous /*null when async*/) {
	var response = new global.KBSemanticHTMLCheckerUtil().getSEONotification(current);
	if(response && response.show_msg && response.msg){
		gs.addInfoMessage(response.msg);
	}
})(current, previous);
