var WIFConnectionHelper = Class.create();
WIFConnectionHelper.prototype = {

    initialize: function() {},

    validateAzureConnection: function(connection) {
        this._normalizeFields(connection, [
            'connection_name', 'tenant_id', 'client_id', 'subject_identifier', 'azure_url_override'
        ]);
        this._requireFields(connection, [
            ['connection_name', 'Connection Name'],
            ['tenant_id', 'Directory (Tenant) ID'],
            ['client_id', 'Application (Client) ID'],
            ['subject_identifier', 'Subject to send in the token']
        ]);
    },

    validateGcpConnection: function(connection) {
        this._normalizeFields(connection, [
            'connection_name', 'project_number', 'identity_pool_name', 'identity_provider_name'
        ]);
        this._requireFields(connection, [
            ['connection_name', 'Connection Name'],
            ['project_number', 'Project Number'],
            ['identity_pool_name', 'Identity Pool Name'],
            ['identity_provider_name', 'Identity Provider Name']
        ]);
    },

    _normalizeFields: function(connection, fieldNames) {
        // Trim leading/trailing whitespace and write the cleaned value back to
        // the in-flight insert so downstream BRs and the stored row stay consistent.
        for (var i = 0; i < fieldNames.length; i++) {
            var field = fieldNames[i];
            var raw = connection.getValue(field);
            if (raw == null) continue;
            var trimmed = String(raw).replace(/^\s+|\s+$/g, '');
            if (trimmed !== raw) {
                connection.setValue(field, trimmed);
            }
        }
    },

    _requireFields: function(connection, requiredFields) {
        var missing = [];
        for (var i = 0; i < requiredFields.length; i++) {
            var field = requiredFields[i][0];
            var label = requiredFields[i][1];
            var value = connection.getValue(field);
            if (!value || !String(value).replace(/^\s+|\s+$/g, '')) {
                missing.push(label);
            }
        }
        if (missing.length) {
            throw new Error('Required field(s) cannot be empty: ' + missing.join(', '));
        }
    },

    setupAzure: function(connection) {
        this.validateAzureConnection(connection);
        var jwtProviderSysId = null;
        var entitySysId = null;
        try {
            jwtProviderSysId = this._createJwtProvider(connection.getValue('connection_name') + ' JWT Provider');

            var instanceUrl = this._instanceUrl();
            this._createClaimValidation(jwtProviderSysId, 'iss', instanceUrl);
            this._createClaimValidation(jwtProviderSysId, 'sub', connection.getValue('subject_identifier'));
            this._createClaimValidation(jwtProviderSysId, 'aud', 'api://AzureADTokenExchange');

            var baseUrl = connection.getValue('azure_url_override') || 'https://login.microsoftonline.com';
            if (baseUrl.charAt(baseUrl.length - 1) === '/') {
                baseUrl = baseUrl.slice(0, -1);
            }
            var tokenUrl = baseUrl + '/' + connection.getValue('tenant_id') + '/oauth2/v2.0/token';

            entitySysId = this._createOAuthEntity({
                name: connection.getValue('connection_name'),
                token_url: tokenUrl,
                client_id: connection.getValue('client_id'),
                default_grant_type: 'client_credentials',
                send_client_credentials_as: 'private_key_jwt_with_client_id',
                jwt_provider: jwtProviderSysId,
                oauth_api_script: ''
            });

            // "Auto generate oauth provider profile" BR fires on oauth_entity insert and creates
            // the default profile — update it rather than inserting a second default profile.
            var profileSysId = this._updateAutoProfile(entitySysId, {
                name: connection.getValue('connection_name') + ' default_profile'
            });
            if (!profileSysId) throw new Error('default oauth_entity_profile not found for entity ' + entitySysId);

            var scopeSysId = this._createScope(entitySysId, 'default', '.default');
            this._createProfileScope(profileSysId, scopeSysId);

            this._linkEntityToConnection(connection, entitySysId);
        } catch (e) {
            this._rollbackSetup(jwtProviderSysId, entitySysId);
            throw e;
        }
    },

    setupGcp: function(connection) {
        this.validateGcpConnection(connection);
        var connectionName = connection.getValue('connection_name');
        var projectNumber = connection.getValue('project_number');
        var poolName = connection.getValue('identity_pool_name');
        var providerName = connection.getValue('identity_provider_name');

        var jwtProviderSysId = null;
        var entitySysId = null;
        try {
            jwtProviderSysId = this._createJwtProvider(connectionName + ' JWT Provider');

            var instanceUrl = this._instanceUrl();
            this._createClaimValidation(jwtProviderSysId, 'iss', instanceUrl);
            this._createClaimValidation(jwtProviderSysId, 'sub', providerName);
            this._createClaimValidation(jwtProviderSysId, 'aud', this._gcpJwtAudience(projectNumber, poolName, providerName));

            var oauthApiScriptSysId = this._getGcpOAuthScript();

            entitySysId = this._createOAuthEntity({
                name: connectionName,
                token_url: 'https://sts.googleapis.com/v1/token',
                client_id: 'gcp_wif',
                default_grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
                send_client_credentials_as: 'request_body_parameter',
                jwt_provider: '',
                oauth_api_script: oauthApiScriptSysId
            });

            // "Auto generate oauth provider profile" BR fires on oauth_entity insert and creates
            // the default profile — update it with GCP-specific fields rather than inserting a second.
            var profileSysId = this._updateAutoProfile(entitySysId, {
                name: connectionName + ' default_profile',
                jwt_provider: jwtProviderSysId,
                token_source: 'jwt_provider',
                audience: this._gcpProfileAudience(projectNumber, poolName, providerName),
                requested_token_type: 'urn:ietf:params:oauth:token-type:access_token'
            });
            if (!profileSysId) throw new Error('default oauth_entity_profile not found for entity ' + entitySysId);

            var scopeSysId = this._createScope(entitySysId, 'GCP Scope', 'https://www.googleapis.com/auth/cloud-platform');
            this._createProfileScope(profileSysId, scopeSysId);

            this._linkEntityToConnection(connection, entitySysId);
        } catch (e) {
            this._rollbackSetup(jwtProviderSysId, entitySysId);
            throw e;
        }
    },

    _rollbackSetup: function(jwtProviderSysId, entitySysId) {
        if (entitySysId) {
            var profileScope = new GlideRecord('oauth_entity_profile_scope');
            profileScope.addQuery('oauth_entity_profile.oauth_entity', entitySysId);
            profileScope.deleteMultiple();

            var scope = new GlideRecord('oauth_entity_scope');
            scope.addQuery('oauth_entity', entitySysId);
            scope.deleteMultiple();

            var profile = new GlideRecord('oauth_entity_profile');
            profile.addQuery('oauth_entity', entitySysId);
            profile.deleteMultiple();

            var entity = new GlideRecord('oauth_entity');
            if (entity.get(entitySysId)) {
                entity.deleteRecord();
            }
        }
        if (jwtProviderSysId) {
            var cv = new GlideRecord('jwt_claim_validation');
            cv.addQuery('jwt_provider', jwtProviderSysId);
            cv.deleteMultiple();

            var jp = new GlideRecord('jwt_provider');
            if (jp.get(jwtProviderSysId)) {
                jp.deleteRecord();
            }
        }
    },

    updateAzure: function(connection) {
        var entitySysId = connection.getValue('oauth_entity');
        if (!entitySysId) return;

        if (connection.tenant_id.changes() || connection.azure_url_override.changes()) {
            var baseUrl = connection.getValue('azure_url_override') || 'https://login.microsoftonline.com';
            if (baseUrl.charAt(baseUrl.length - 1) === '/') {
                baseUrl = baseUrl.slice(0, -1);
            }
            var tokenUrl = baseUrl + '/' + connection.getValue('tenant_id') + '/oauth2/v2.0/token';
            var entity = new GlideRecord('oauth_entity');
            if (entity.get(entitySysId)) {
                entity.setValue('token_url', tokenUrl);
                entity.update();
            }
        }

        if (connection.client_id.changes()) {
            var entity2 = new GlideRecord('oauth_entity');
            if (entity2.get(entitySysId)) {
                entity2.setValue('client_id', connection.getValue('client_id'));
                entity2.update();
            }
        }

        if (connection.subject_identifier.changes()) {
            var jwtProviderId = this._getEntityJwtProvider(entitySysId);
            if (jwtProviderId) {
                this._updateClaimValidation(jwtProviderId, 'sub', connection.getValue('subject_identifier'));
            }
        }

        if (connection.connection_name.changes()) {
            this._updateNames(entitySysId, connection.getValue('connection_name'), 'azure');
        }
    },

    cleanup: function(connection) {
        var entitySysId = connection.getValue('oauth_entity');
        if (!entitySysId) return;

        // Collect jwt_provider ids before deletion — Azure stores it on oauth_entity,
        // GCP stores it on oauth_entity_profile, so check both.
        var jwtProviderIds = this._collectJwtProviders(entitySysId);

        var profileScope = new GlideRecord('oauth_entity_profile_scope');
        profileScope.addQuery('oauth_entity_profile.oauth_entity', entitySysId);
        profileScope.deleteMultiple();

        var scope = new GlideRecord('oauth_entity_scope');
        scope.addQuery('oauth_entity', entitySysId);
        scope.deleteMultiple();

        var profile = new GlideRecord('oauth_entity_profile');
        profile.addQuery('oauth_entity', entitySysId);
        profile.deleteMultiple();

        var entity = new GlideRecord('oauth_entity');
        if (entity.get(entitySysId)) {
            entity.deleteRecord();
        }

        if (jwtProviderIds.length) {
            // Delete claim validations first — jwt_claim_validation.jwt_provider has a
            // Restrict cascade, so jwt_provider deleteMultiple fails silently while
            // children still reference it.
            var cv = new GlideRecord('jwt_claim_validation');
            cv.addQuery('jwt_provider', 'IN', jwtProviderIds.join(','));
            cv.deleteMultiple();

            // Delete jwt_providers one at a time so a single ACL/cascade failure
            // doesn't silently skip the rest, and we get an actionable log line.
            for (var i = 0; i < jwtProviderIds.length; i++) {
                var jp = new GlideRecord('jwt_provider');
                if (jp.get(jwtProviderIds[i]) && !jp.deleteRecord()) {
                    gs.error('WIF cleanup: failed to delete jwt_provider ' +
                        jwtProviderIds[i] + ': ' + jp.getLastErrorMessage());
                }
            }
        }
    },

    _collectJwtProviders: function(entitySysId) {
        var seen = {};
        var entity = new GlideRecord('oauth_entity');
        if (entity.get(entitySysId)) {
            var entityJwt = entity.getValue('jwt_provider');
            if (entityJwt) seen[entityJwt] = true;
        }
        var profile = new GlideRecord('oauth_entity_profile');
        profile.addQuery('oauth_entity', entitySysId);
        profile.query();
        while (profile.next()) {
            var profileJwt = profile.getValue('jwt_provider');
            if (profileJwt) seen[profileJwt] = true;
        }
        var result = [];
        for (var id in seen) {
            if (seen.hasOwnProperty(id)) result.push(id);
        }
        return result;
    },

    updateGcp: function(connection) {
        var entitySysId = connection.getValue('oauth_entity');
        if (!entitySysId) return;

        var projectNumber = connection.getValue('project_number');
        var poolName = connection.getValue('identity_pool_name');
        var providerName = connection.getValue('identity_provider_name');

        if (connection.project_number.changes() || connection.identity_pool_name.changes() || connection.identity_provider_name.changes()) {
            var jwtProviderId = this._getProfileJwtProvider(entitySysId);
            if (jwtProviderId) {
                this._updateClaimValidation(jwtProviderId, 'aud', this._gcpJwtAudience(projectNumber, poolName, providerName));
                if (connection.identity_provider_name.changes()) {
                    this._updateClaimValidation(jwtProviderId, 'sub', providerName);
                }
            }
            var profile = new GlideRecord('oauth_entity_profile');
            profile.addQuery('oauth_entity', entitySysId);
            profile.addQuery('default', true);
            profile.setLimit(1);
            profile.query();
            if (profile.next()) {
                profile.setValue('audience', this._gcpProfileAudience(projectNumber, poolName, providerName));
                profile.update();
            }
        }

        if (connection.connection_name.changes()) {
            this._updateNames(entitySysId, connection.getValue('connection_name'), 'gcp');
        }
    },

    _instanceUrl: function() {
        // InstanceURLUtil doesn't expose a jsFunction accessible from Rhino for this purpose
        var url = gs.getProperty('glide.servlet.uri') || '';
        return url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
    },

    _gcpJwtAudience: function(projectNumber, poolName, providerName) {
        return 'https:' + this._gcpProfileAudience(projectNumber, poolName, providerName);
    },

    _gcpProfileAudience: function(projectNumber, poolName, providerName) {
        return '//iam.googleapis.com/projects/' + projectNumber +
            '/locations/global/workloadIdentityPools/' + poolName +
            '/providers/' + providerName;
    },

    _createJwtProvider: function(name) {
        // sys_policy=read on jwt_keystore blocks GlideRecord query; use the known sys_id
        var WIF_KEYSTORE_SYS_ID = '542dcf543740031038572d1964924baa';

        var gr = new GlideRecord('jwt_provider');
        gr.initialize();
        gr.setValue('name', name);
        gr.setValue('expiry_interval', 60);
        gr.setValue('jwt_keystore_alias', WIF_KEYSTORE_SYS_ID);
        var sysId = gr.insert();
        if (!sysId) {
            throw new Error(gr.getLastErrorMessage());
        }
        return sysId;
    },

    _createClaimValidation: function(jwtProviderSysId, claimName, claimValue) {
        // PopulateDefaultStandardClaims BR creates iss/sub/aud with empty values on
        // every jwt_provider insert — update that record rather than re-inserting.
        var gr = new GlideRecord('jwt_claim_validation');
        gr.addQuery('jwt_provider', jwtProviderSysId);
        gr.addQuery('name', claimName);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            gr.setValue('claim_value', claimValue);
            gr.setValue('claim_value_type', 'string');
            gr.setValue('is_standard_claim', true);
            if (!gr.update()) {
                throw new Error(gr.getLastErrorMessage());
            }
            return gr.getUniqueValue();
        }
        gr.initialize();
        gr.setValue('jwt_provider', jwtProviderSysId);
        gr.setValue('name', claimName);
        gr.setValue('claim_value', claimValue);
        gr.setValue('claim_value_type', 'string');
        gr.setValue('is_standard_claim', true);
        var sysId = gr.insert();
        if (!sysId) {
            throw new Error(gr.getLastErrorMessage());
        }
        return sysId;
    },

    _createOAuthEntity: function(params) {
        var instanceUrl = this._instanceUrl();
        var gr = new GlideRecord('oauth_entity');
        gr.initialize();
        gr.setValue('name', params.name);
        gr.setValue('type', 'oauth_provider');
        gr.setValue('active', true);
        gr.setValue('access', 'public');
        gr.setValue('token_url', params.token_url);
        gr.setValue('client_id', params.client_id);
        gr.setValue('default_grant_type', params.default_grant_type);
        gr.setValue('send_client_credentials_as', params.send_client_credentials_as);
        gr.setValue('access_token_lifespan', 1800);
        gr.setValue('redirect_url', instanceUrl + '/oauth_redirect.do');
        gr.setValue('sub_claim', 'sys_id');
        if (params.jwt_provider) {
            gr.setValue('jwt_provider', params.jwt_provider);
        }
        if (params.oauth_api_script) {
            gr.setValue('oauth_api_script', params.oauth_api_script);
        }
        var sysId = gr.insert();
        if (!sysId) {
            throw new Error(gr.getLastErrorMessage());
        }
        return sysId;
    },

    _createScope: function(entitySysId, name, scopeValue) {
        var gr = new GlideRecord('oauth_entity_scope');
        gr.initialize();
        gr.setValue('oauth_entity', entitySysId);
        gr.setValue('name', name);
        gr.setValue('oauth_entity_scope', scopeValue);
        gr.setValue('in_default_profile', true);
        var sysId = gr.insert();
        if (!sysId) {
            throw new Error(gr.getLastErrorMessage());
        }
        return sysId;
    },

    _updateAutoProfile: function(entitySysId, updates) {
        var profile = new GlideRecord('oauth_entity_profile');
        profile.addQuery('oauth_entity', entitySysId);
        profile.addQuery('default', true);
        profile.setLimit(1);
        profile.query();
        if (!profile.next()) return null;
        for (var field in updates) {
            if (updates.hasOwnProperty(field)) {
                profile.setValue(field, updates[field]);
            }
        }
        profile.update();
        return profile.getUniqueValue();
    },

    _createProfile: function(params) {
        var gr = new GlideRecord('oauth_entity_profile');
        gr.initialize();
        gr.setValue('oauth_entity', params.entity);
        gr.setValue('name', params.name);
        gr.setValue('grant_type', params.grant_type);
        gr.setValue('default', params.isDefault ? true : false);
        if (params.jwt_provider) {
            gr.setValue('jwt_provider', params.jwt_provider);
            gr.setValue('token_source', params.token_source || 'jwt_provider');
        }
        if (params.audience) {
            gr.setValue('audience', params.audience);
        }
        if (params.requested_token_type) {
            gr.setValue('requested_token_type', params.requested_token_type);
        }
        var sysId = gr.insert();
        if (!sysId) {
            throw new Error(gr.getLastErrorMessage());
        }
        return sysId;
    },

    _createProfileScope: function(profileSysId, scopeSysId) {
        var gr = new GlideRecord('oauth_entity_profile_scope');
        gr.initialize();
        gr.setValue('oauth_entity_profile', profileSysId);
        gr.setValue('oauth_entity_scope', scopeSysId);
        var sysId = gr.insert();
        if (!sysId) {
            throw new Error(gr.getLastErrorMessage());
        }
        return sysId;
    },

    _getGcpOAuthScript: function() {
        // sys_id of the OAuthAPIForGoogleWIF script include shipped with this plugin
        return 'dcc8851cfff003103808ffffffffffd6';
    },

    _linkEntityToConnection: function(connection, entitySysId) {
        // Called from a before-insert BR — setValue is picked up by the in-flight
        // insert, so no update() is needed (and update() on an unsaved row would fail).
        connection.setValue('oauth_entity', entitySysId);
    },

    _getEntityJwtProvider: function(entitySysId) {
        var entity = new GlideRecord('oauth_entity');
        if (!entity.get(entitySysId)) return null;
        return entity.getValue('jwt_provider');
    },

    _getProfileJwtProvider: function(entitySysId) {
        var profile = new GlideRecord('oauth_entity_profile');
        profile.addQuery('oauth_entity', entitySysId);
        profile.addQuery('default', true);
        profile.setLimit(1);
        profile.query();
        if (!profile.next()) return null;
        return profile.getValue('jwt_provider');
    },

    _updateClaimValidation: function(jwtProviderSysId, claimName, newValue) {
        var cv = new GlideRecord('jwt_claim_validation');
        cv.addQuery('jwt_provider', jwtProviderSysId);
        cv.addQuery('name', claimName);
        cv.setLimit(1);
        cv.query();
        if (cv.next()) {
            cv.setValue('claim_value', newValue);
            cv.update();
        }
    },

    _updateNames: function(entitySysId, newConnectionName, provider) {
        var entity = new GlideRecord('oauth_entity');
        if (!entity.get(entitySysId)) return;

        var oldName = entity.getValue('name');
        entity.setValue('name', newConnectionName);
        entity.update();

        var jwtProviderId = provider === 'azure'
            ? entity.getValue('jwt_provider')
            : this._getProfileJwtProvider(entitySysId);
        if (jwtProviderId) {
            var jp = new GlideRecord('jwt_provider');
            if (jp.get(jwtProviderId)) {
                jp.setValue('name', newConnectionName + ' JWT Provider');
                jp.update();
            }
        }

        var profile = new GlideRecord('oauth_entity_profile');
        profile.addQuery('oauth_entity', entitySysId);
        profile.addQuery('name', oldName + ' default_profile');
        profile.setLimit(1);
        profile.query();
        if (profile.next()) {
            profile.setValue('name', newConnectionName + ' default_profile');
            profile.update();
        }
    },

    type: 'WIFConnectionHelper'
};
