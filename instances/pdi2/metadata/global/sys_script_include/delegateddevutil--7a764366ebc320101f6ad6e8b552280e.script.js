var DelegatedDevUtil = (function() {
	return {
		canAccessManageCollaboratorsUI: function(appGr) {
			var answer = false;
			if (!isValidApp(appGr))
				return answer;

			answer = checkAppIsNotPrivateAndGlobal(appGr) && areCollaborationFeaturePluginsActive();

			return answer;
		},

		canAccessManageDevelopersUI: function(appGr) {
			var answer = false;
			if (!isValidApp(appGr))
				return answer;

			answer = this.canAccessManageCollaboratorsUI(appGr);

			// The Manage Developers UI should not be displayed if the user can access the Manage Collaborators UI
			if (answer)
				return false;

			answer = checkAppIsNotPrivateAndGlobal(appGr) && isScopeAdmin(appGr);
			return answer;
		}
	};

	function areCollaborationFeaturePluginsActive() {
		// Check if the collaboration feature plugins are active
		var answer = GlidePluginManager.isActive('com.snc.collaboration-request') && GlidePluginManager.isActive('com.glide.app_collaboration');

		return answer;
	}

	function isScopeAdmin(appGr) {
		var answer = false;
		var enabledScopedAdministration = appGr.getValue('scoped_administration') == '1';

		answer = ((!enabledScopedAdministration && gs.hasRole('admin')) || (enabledScopedAdministration && GlideSecurityManager.get().isScopeAdmin(appGr.getValue('sys_id'))));
		return answer;
	}

	function checkAppIsNotPrivateAndGlobal(appGr) {
		return appGr.getValue('private') != '1' && appGr.getValue('scope') !== 'global';
	}

	function isValidApp(appGr) {
		var answer = !!appGr && appGr instanceof GlideRecord && appGr.instanceOf('sys_scope');
		if (!answer)
			gs.error("DelegatedDevUtil: Invalid application GlideRecord supplied");

		return answer;
	}

})();
