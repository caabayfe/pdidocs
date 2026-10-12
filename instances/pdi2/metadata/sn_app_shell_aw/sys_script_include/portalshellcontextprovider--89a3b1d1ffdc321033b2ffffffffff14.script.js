var PortalShellContextProvider = Class.create();
PortalShellContextProvider.prototype = {
    initialize: function() {
    },
	provideMenuItems: function () {
		// No default menu items. 
		return [];
	},
	provideActionButtons: function() {
		// No deafault action buttons.
		return [];
	},
	process: function(context) {
		var result = {
			items: [],
			actionButtons: [],
			errMsg: []
		};
		var availableExtPoints = new GlideScriptedExtensionPoint().getExtensions("sn_app_shell_aw.PortalShellMenuContextProvider");
		var validExtensionPoints = availableExtPoints.filter(function (extPoint) {
			if (typeof extPoint.getAppId !== 'function')
				return false;
			try {
				return extPoint.getAppId() === context.appId;
			} catch (e) {
				result.errMsg.push(e + "");
			}
			return false;
		});
		// If not valid extension point found.
		if (validExtensionPoints.length === 0) {
			result.errMsg.push(gs.getMessage("Unable to find the valid extension point, loading default "));
		}
		// If no valid extension, provide will use default implementations.
		var api = validExtensionPoints.length > 0 ? validExtensionPoints[0] : this;
		if (typeof api.provideMenuItems === 'function') {
			try {
				result.items = api.provideMenuItems(context);
			} catch (e) {
				var errorMessage = e + '';
				result.errMsg.push(errorMessage);
			}
		}
		if (typeof api.provideActionButtons === 'function') {
			try {
				result.actionButtons = api.provideActionButtons(context);
			} catch (e) {
				var errorMessage = e + '';
				result.errMsg.push(errorMessage);
			}
		}
		return result;
	},
    type: 'PortalShellContextProvider'
};
