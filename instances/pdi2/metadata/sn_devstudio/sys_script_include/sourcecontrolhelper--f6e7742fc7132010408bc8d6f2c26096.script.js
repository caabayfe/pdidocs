var SourceControlHelper = (function() {
	return {
		getAppropriateCredential: function(url, credential) {
			var updatedCredential = "";
			if (VCSAppAccessCheck.canAccessCredentials())
				updatedCredential = credential;
			
			if (!updatedCredential) {
				var urlRegex = /^(http|https):\/\//;
				var isHttps = urlRegex.test(url);
				if (isHttps) {
					updatedCredential = gs.getProperty("glide.source_control.default_basic_auth_credential_sys_id");
				} else {
					updatedCredential = gs.getProperty("glide.source_control.default_ssh_private_key_credential_sys_id");
				}
			}
			
			if (!updatedCredential) {
				throw new sn_ws_err.BadRequestError(gs.getMessage('Missing credentials to link to Source Control. Contact your system administrator.'));
			}
			
			return updatedCredential;
		}
	};
})();
