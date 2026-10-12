var VCSAppAccessCheck = (function () {
	return {
		verifyReadAccess: function (appId) {
			// If the application is app customization capable read access is allowed.
			if (_isAppCustomizationCapableApp(appId)) return true;

			var gr = attemptAppLoad(appId);
			return gr.canRead();
		},

		verifyWriteAccess: function (appId) {
			// If the application is app customization capable write access is allowed.
			if (_isAppCustomizationCapableApp(appId)) return true;

			var gr = attemptAppLoad(appId);

			// PRB683568 : For delegated developers canWrite always gives false
			// PRB1365169 : modified the temporary fix originally made for PRB683568
			//              which was calling canRead() for all users
			if (isDelegatedDeveloper() && !gr.canRead()) return false;

			if (!isDelegatedDeveloper() && !gr.canWrite()) return false;

			return true;
		},

		verifyPublishAccess: function (appId) {
			return canPublishApp(appId);
		},

		verifyCreateAccess: function () {
			var gr = new GlideRecord('sys_app');
			return gr.canCreate();
		},

		verifyVersionControlAccess: function (appId) {
			return canAccessVersionControl(appId);
		},

		isGACOrSourceControlUser: function () {
			// This provides backward compatibility and handles the case where
			// the user does not have the collaboration plugin installed
			var user = gs.getUser();
			var hasGACRole = user.hasRole('sn_g_app_creator.app_creator');
			var hasSourceControlRole = user.hasRole('source_control');
			if (hasGACRole || hasSourceControlRole) return true;
		},

		canAccessCredentials: function () {
			return (
				gs.hasRightsTo('record/discovery_credentials/read') || gs.hasRole('source_control')
			);
		},

		throwAccessDenied: function (appId) {
			throw new sn_ws_err.ServiceError()
				.setStatus(403)
				.setMessage(
					appId
						? gs.getMessage('Access denied to application {0}', appId)
						: gs.getMessage('Access denied to create a new application')
				);
		},
	};

	function _isAppCustomizationCapableApp(appId) {
		return (
			sn_app_customization.AppCustomizationAPI.isAppCustomizationFeatureEnabled() &&
			sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(appId) &&
			isDelegatedDeveloper()
		);
	}

	function attemptAppLoad(appId) {
		var gr = new GlideRecord('sys_app');
		if (!gr.get(appId)) throw new sn_ws_err.NotFoundError('Invalid application id ' + appId);

		return gr;
	}

	function isDelegatedDeveloper() {
		return gs.hasRole('delegated_developer') && !gs.hasRole('admin');
	}

	function canPublishApp(appId) {
		return (
			sn_app_api.AppStoreAPI.canPublishToAppRepo(appId) ||
			sn_app_api.AppStoreAPI.canPublishToAppStore(appId)
		);
	}

	function canAccessVersionControl(appId) {
		return gs.hasRightsTo('api/now.vcs/allow', {
			scopeId: appId,
		});
	}
})();
