(function executeRule(current, previous /*null when async*/) {

	var findValidLandingPagePlaceholder = new FindValidLandingPagePlaceholder();
	var currentPlaceholderId = current.getValue('placeholder');
	var currentPlaceholderName = current.getDisplayValue('placeholder');
	var currentPageRegistryId = current.getValue('applicable_page');
	var currentApplicability = current.getValue('applicability');
	
	// Determine if the placeholder of the element about to be persisted is a valid landing page placeholder for the
	// selected page registry (and therefor workspace)
	var isValidLandingPagePlaceholder = findValidLandingPagePlaceholder.isValidLandingPagePlaceholder(currentPlaceholderId, currentPageRegistryId, currentApplicability);
	
	// Valid lading page placeholder name is determined here (ie "Landing Page Placeholder")
	var validLandingPagePlaceholderName = findValidLandingPagePlaceholder.getValidLandingPagePlaceholderName();
		
	// ONLY modify the placeholder if its name is "Landing Page Placeholder" and the current placeholder is an
	// invalid landing page placeholder for the page registry
	if (currentPlaceholderName === validLandingPagePlaceholderName && !isValidLandingPagePlaceholder) {
		current.setValue('placeholder', findValidLandingPagePlaceholder.getValidLandingPagePlaceholder(currentPageRegistryId) || currentPlaceholderId);
	}

})(current, previous);
