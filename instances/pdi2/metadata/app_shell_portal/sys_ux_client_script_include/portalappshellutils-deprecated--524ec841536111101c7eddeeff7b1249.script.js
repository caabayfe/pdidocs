// Portal App Shell client script include

function include() {
	class PortalAppShellUtils {
		static dataFetchSuccess(api, event, helpers, imports) {
			const appShellDataSource = api.data.portal_app_shell_data_source.uxPropertiesAndAuthRoutes;
			const isMenuItemsPageProperty = appShellDataSource?.chrome_menu && appShellDataSource?.chrome_menu?.global.length !== 0;
			let menuItems = appShellDataSource?.chrome_menu?.global || [];
			let actionButtons = appShellDataSource?.chrome_menu_actions?.global || [];

			if (!isMenuItemsPageProperty) {
				const dataOutput = { ...api.data.portal_appshell_menu_provider.output };
				menuItems = dataOutput?.items || [];
				actionButtons = dataOutput?.actionButtons || {};
			}

			api.setState('menuItems', menuItems);
			api.setState('menuActionButtons', actionButtons);
		}
	}

	return PortalAppShellUtils;
}
