(function executeRule(current, previous /*null when async*/) {
 var exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]*$/ig;
	if(!current.number.toString().match(exp)){
		gs.addErrorMessage(gs.getMessage("Article number should contain only alphabets and numbers"));
		current.setAbortAction(true);
	}
	
})(current, previous);
