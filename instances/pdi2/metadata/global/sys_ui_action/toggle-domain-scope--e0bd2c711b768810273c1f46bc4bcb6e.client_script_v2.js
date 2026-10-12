function onClick(g_form) {
	var provider = g_aw.domainScopeProvider();
	provider.toggleDomainScope();
	var domainScopeNow = provider.getDomainScope();
	if (domainScopeNow === 'SESSION')
		g_form.addInfoMessage(getMessage("Domain Scope Expanded"));
	else if (domainScopeNow === 'RECORD')
		g_form.addInfoMessage(getMessage("Domain Scope Collapsed"));
}
