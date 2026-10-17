(function executeRule(current, previous /*null when async*/) {
	if(new KBCommon().isArticleReadOnlyBasedOnDomain(current) && !current.isNewRecord())
	{
		if(gs.getProperty('glide.knowman.allow_edit_global_articles')=='false'){
			if(gs.hasRole('admin'))
			{
				gs.addInfoMessage(gs.getMessage("This article is in global domain. To edit change your domain to global domain."));
			}
			else
			{
				gs.addInfoMessage(gs.getMessage("This article cannot be edited. To edit, contact your administrator."));
				gs.log("User's domain is different from article's domain.");
			}
		}
		else{
			gs.addInfoMessage(gs.getMessage("This article is in global domain. Editing it might change the domain of the article and affect view permissions."));
		}
	}  

})(current, previous);
