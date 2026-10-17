// eslint-disable-next-line no-unused-vars
function paginationControlPolicy({trigger, api, properties}) {
	if (trigger === 'hideRange') {
		api.updateEnabled('rangeLabel', !properties.hideRange);
	}
	if (trigger === 'hidePageNumbers') {
		api.updateEnabled('visiblePages', !properties.hidePageNumbers);
	}
	if (trigger === 'hidePageSizeControl') {
		api.updateEnabled('pageSizeLabel', !properties.hidePageSizeControl);
	}
	if (trigger === 'pageControlType') {
		api.updateEnabled(
			'hidePageNumbers',
			properties.pageControlType == 'buttons',
		);
		api.updateEnabled('visiblePages', properties.pageControlType === 'buttons');
	}
}
