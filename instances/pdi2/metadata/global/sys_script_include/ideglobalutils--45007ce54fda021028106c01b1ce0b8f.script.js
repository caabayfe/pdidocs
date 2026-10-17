var IDEGlobalUtils = Class.create();

IDEGlobalUtils.prototype = {
    initialize: function() {},

	/**
     * Validate scope using naming rules
     * @param {String} scopeName scope name to validate
     * @returns {Boolean}
     */
	validateScopeName: function(scopeName) {
        if (scopeName === 'global') {
            return;
        }

        const MAX_SCOPE_LENGTH = 18;
        if (scopeName.length > MAX_SCOPE_LENGTH) {
            throw new Error("Scope name too long.");
        }

        const notNumberUnderscoreLowercase = /[^a-z0-9_]/.test(scopeName);
        const containsDoubleUnderScore = /__+/.test(scopeName);

        if (notNumberUnderscoreLowercase || containsDoubleUnderScore) {
            throw new Error("Scope can only contain lowercase letters, numbers, and single underscores.");
        }

        var endsInUnderscores = /_+$/.test(scopeName);

        if (endsInUnderscores) {
            throw new Error("Scope cannot end in an underscore.");
        }

        var scopePrefix = gs.getNewAppScopeCompanyPrefix();

        if (!scopeName.startsWith(scopePrefix)) {
            throw new Error("Scope must start with " + scopePrefix + ".");
        }
    },

    attemptCreation: function(name, scope, description, ide_created) {
		if (!name || !scope || !ide_created || !description) {
			throw new Error('Invalid arguments to IDEGlobalUtils');
		}

		gs.info('[IDEGlobalUtils] name: ' + name);
		// Adds new value specifying apps created by our IDE.
		// See: https://code.devsnc.com/dev/glide/blob/d12e0406192874b998e38221115d512186a0068a/glide-paas/src/main/java/com/snc/apps/creator/AppCreator.java#L208
		gs.info('ide_created: ' + ide_created);
		gs.info('attemptCreation: ' + name);

		if (name === 'Global') {
			throw new Error('Invalid name. \'Global\' is a reserved word');
		}

		// We manually check for these instead of letting the flow action,
		// as it doesn't output meaningful errors.
		this.validateScopeName(scope);

		var inputs = {};
		inputs['application_name'] = name;
		inputs['ide_created'] = ide_created;
		inputs['scope'] = scope;
		inputs['short_description'] = description;

		try {
			var result = sn_fd.FlowAPI.getRunner()
				.action('global.create_templated_scoped_application')
				.withInputs(inputs)
				.inForeground()
				.run();

			return result.getOutputs()['scoped_app_output'];
		}
		catch (e) {
			// We check for the other errors already - if we hit this point, it's a uniquness error.
			throw new Error('Ensure scope is unique on instance and app repo.')
		}
    },

    deleteSysAppRecord: function(sysId) {
        var gr = new GlideRecord('sys_app');

        if (gr.get(sysId)) {
            gs.info(`[sn_glider] sys_app:${sysId} reocrd deleted successfully`);
            return gr.deleteRecord();
        } else {
            gs.error('[sn_glider] sys_app record not found: ' + sysId);
            return false;
        }
    },

    getTransactionId: function() {
        return GlideSecurityManager.getTransactionID();
    },

    /**
     * Removes the mandatory flag from `auth_credential` field in the `sn_glider_ide_git_credential` table.
     */
    fixIdeGitCredentialTableSchema: function() {
        function removeMandatoryFromField(fieldName) {
            gs.info('Removing from sn_glider_ide_git_credential mandatory for field ' + fieldName);
            var dictionaryGr = new GlideRecord('sys_dictionary');
            dictionaryGr.addQuery('name', 'sn_glider_ide_git_credential');
            dictionaryGr.addQuery('element', fieldName);
            dictionaryGr.query();
            if (dictionaryGr.next()) {
                dictionaryGr.setValue('mandatory', 'false');
                dictionaryGr.update();
            } else {
                gs.info('[IDE] Failed to fix dictionary entry for table: sn_glider_ide_git_credential. Could not find a valid dictionary record for field :' + fieldName);
            }
        }

        removeMandatoryFromField('auth_credential');
    },

    // To check whether it is PDI
    isPDI: function() {
        var isPDI = false;
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', 'sn_dev_prg_pdi');
        gr.query();
        if (gr.next()) {
            isPDI = (gr.getValue('write_roles') === 'maint' &&
                gr.getValue('value') === "true");
        }
        return isPDI;
    },

    /**
     * Update sys_service_endpoint for IDEFluentService when IDE is used in PDI
     * Callable from a fix script
     */
    updateSysServiceEndpointForPDI: function() {
        if (!this.isPDI()) {
            return;
        }

        var FLUENT_SERVICE_NAME = 'IDEFluentService';
        // Directly using SysID, reduce query for sys_service
        var IDE_FLUENT_SERVICE_SYSID = 'c911da60a3a8421010ba0373341e61d8';
        // get the associated sys_service_endpoint
        var ideSysServiceEndpoint = new GlideRecord('sys_service_endpoint');
        ideSysServiceEndpoint.addQuery('service', IDE_FLUENT_SERVICE_SYSID);
        ideSysServiceEndpoint.setLimit(1);
        ideSysServiceEndpoint.query();
        if (!ideSysServiceEndpoint.hasNext()) {
            gs.warn('[IDE] Sys_service_endpoint record for IDEFluentService was not found');
            return;
        }

        ideSysServiceEndpoint.next();
        // update url for PDI instances
        ideSysServiceEndpoint.setValue('url', 'https://forge-pdi');
        ideSysServiceEndpoint.setWorkflow(false);
        var isUpdated = ideSysServiceEndpoint.update();
        if (!isUpdated) {
            gs.warn('[IDE] Sys_service_endpoint record for IDEFluentService was not updated for PDI');
            return;
        }
        gs.info('[IDE] Sys_service_endpoint record for IDEFluentService was successfully updated for PDI');
        //update refresh connection
        sn_internal_services.ServiceConfig.refreshInCluster(FLUENT_SERVICE_NAME);
        gs.info('[IDE] Refreshed connection for IDEFluentService to support PDIs');
    },

	/**
     * Creates a new basic auth credential record.
     * @param {String} gitUsername - The username for the Git account.
     * @param {String} personalAccessToken - The personal access token for the Git account.
     * @param {String} newCredentialName - The name for the new credential.
     */
    createBasicAuthCredential: function(gitUsername, personalAccessToken, newCredentialName) {
        var basicAuthGr = new GlideRecord('basic_auth_credentials');
        basicAuthGr.initialize();
        basicAuthGr.user_name = gitUsername;
        basicAuthGr.password.setDisplayValue(personalAccessToken);
        basicAuthGr.name = newCredentialName;

        var authUniqueSysId = basicAuthGr.insert();
        if (!authUniqueSysId) {
            throw new Error('Failed to create basic auth credential record');
        }

        return authUniqueSysId;
    },

    /**
     * Creates a new OAuth 2.0 credential record.
     * @param {String} gitUsername - The username for the Git account.
     * @param {String} oauthEntityProfileSysId - The sys_id of the OAuth entity profile.
     * @param {String} newCredentialName - The name for the new credential.
     */
    createOAuthCredential: function(gitUsername, oauthEntityProfileSysId, newCredentialName) {
        var oAuthGr = new GlideRecord('oauth_2_0_credentials');
        oAuthGr.initialize();
        oAuthGr.user_name = gitUsername;
        oAuthGr.oauth_entity_profile = oauthEntityProfileSysId;
        oAuthGr.name = newCredentialName;
        oAuthGr.integration_type = 'personal';
        var authUniqueSysId = oAuthGr.insert();
        if (!authUniqueSysId) {
            throw new Error('Failed to create OAuth credential record');
        }

        return authUniqueSysId;
    },

    type: 'IDEGlobalUtils'
};
