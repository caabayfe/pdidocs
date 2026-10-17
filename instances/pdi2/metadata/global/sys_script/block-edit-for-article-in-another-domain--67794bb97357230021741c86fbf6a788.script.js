(function executeRule(current, previous /*null when async*/) {
	if(new KBCommon().isArticleReadOnlyBasedOnDomain(current))
	{
		gs.addErrorMessage(gs.getMessage("This article is in global domain. To edit change your domain to global domain."));
		current.setAbortAction(true);
	}

})(current, previous);
