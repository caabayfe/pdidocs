function policy({api, trigger, properties}) {
	const showHeading = properties.showHeading === true;
	const allowCollapse = properties.allowCollapse === true;
	const enableAdvancedSearch = properties.enableAdvancedSearch === true;
	const enableVerify = properties.enableVerify === true;
  	const showSearchView = !properties.searchFields;
	const showSelectedView = !properties.selectedFields;

	if (!trigger || trigger === 'showHeading') {
		api.updateVisibility('heading', showHeading);
		api.updateVisibility('headingStyle', showHeading);
	}

	if (!trigger || trigger === 'allowCollapse') {
		api.updateVisibility('collapseByDefault', allowCollapse);
	}

	if (!trigger || trigger === 'enableAdvancedSearch') {
		api.updateVisibility('advancedSearchConfig', enableAdvancedSearch);
	}

  	if (!trigger || trigger === 'enableVerify') {
		api.updateVisibility('isVerified', enableVerify);
		api.updateVisibility('verifyButtonLabel', enableVerify);
	}

	if (!trigger || trigger === 'searchFields') {
		api.updateVisibility('searchView', showSearchView);
	}

	if (!trigger || trigger === 'selectedFields') {
		api.updateVisibility('selectedView', showSelectedView);
	}
}
