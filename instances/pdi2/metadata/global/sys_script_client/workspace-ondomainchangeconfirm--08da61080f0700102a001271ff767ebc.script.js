function onSubmit() {
	
	if (typeof g_aw === 'undefined' || !g_aw.domainScopeProvider || typeof g_scratchpad === 'undefined') return true;

	if (g_scratchpad._domainConfirmationPassed
		|| g_scratchpad._domainCheckErrorBypass
		|| g_scratchpad._domainCheckPassed)
		return true;

	var provider = g_aw.domainScopeProvider();
	
	if (!provider || !provider.isDomainEnabledRecord || !provider.isDomainEnabledRecord()) return true;

	// if you change these messages, please change them in the above messages field
	var title = getMessage("Change Domain");
	var message = getMessage("You are about to change the domain of this record which may result in data loss. We will copy the information we can but you may need to replace the lost data. Do you want to proceed?");
	
	var gFormRef = g_form;
	
	var popModalConfirm = function() {
		g_modal.confirm(title, message , function(response) {
			if (response) {
				g_scratchpad._domainConfirmationPassed = true;
				gFormRef.submit(gFormRef.getActionName());
			}
		});
		return false;
	};
	
	var proceedWithSubmit = function() {
		gFormRef.submit(gFormRef.getActionName());
	};
	
	var hasDomainChanged = provider.hasDomainChanged();
	if (hasDomainChanged === false) 
		return true;
	if (hasDomainChanged === true)
		return popModalConfirm();
	else {
		hasDomainChanged.then(function(isChanged) {
			if (isChanged)
				return popModalConfirm();
			else {
				g_scratchpad._domainCheckPassed = true;
				proceedWithSubmit();
			}
		}, function(error) {
			g_scratchpad._domainCheckErrorBypass = true;
			proceedWithSubmit();
		});
		return false;
	}
}
