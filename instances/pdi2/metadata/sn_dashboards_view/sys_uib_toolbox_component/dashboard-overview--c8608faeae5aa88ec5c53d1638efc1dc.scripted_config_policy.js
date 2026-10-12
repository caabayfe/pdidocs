// eslint-disable-next-line no-unused-vars
function snDashboardsOverviewPolicy({trigger, api, properties}) {
	if (trigger === 'displayAllDashboards' || trigger === null) {
		const show = !properties.displayAllDashboards;
		api.updateVisibility('showAllTab', show);
		api.updateVisibility('showCertified', show);
		api.updateVisibility('showBookmarked', show);
		api.updateVisibility('showPersonalizedLanguage', show);
		api.updateVisibility('hideCreateButton', show);
	}
}
