(function executeRule(current, previous /*null when async*/) {

	if (!gs.nil(current) && !gs.nil(current.type) && 
		(current.type.equalsIgnoreCase('text') || current.type.equalsIgnoreCase('custom'))) 
	{	
		gs.addErrorMessage(gs.getMessage('{0} is not a valid type -- it is reserved.', GlideStringUtil.escapeHTML(current.type)));
		current.setAbortAction(true);	
	}

})(current, previous);
