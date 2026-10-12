var VAGoogleInstanceBot = Class.create();
VAGoogleInstanceBot.prototype = {
	initialize: function() {
	},

	createOidcConfig: function(botName) {
		var oidcProviderConfigSysId = null;
		var oidcProviderConfigGR = new GlideRecord('oidc_provider_configuration');
		oidcProviderConfigGR.initialize();
		oidcProviderConfigGR.setValue('name', 'google-chat-bot-oidc-' + botName);
		oidcProviderConfigGR.setValue('oidc_url', 'https://accounts.google.com/.well-known/openid-configuration');
		oidcProviderConfigGR.setValue('enable_jti_verification', false);
		oidcProviderConfigGR.setValue('user_claim', 'email');
		oidcProviderConfigGR.setValue('user_field', 'email');
		oidcProviderConfigSysId = oidcProviderConfigGR.insert();

		return oidcProviderConfigSysId;
	},

	createOidcEntity: function(groupName, oidcProviderConfigSysId) {
		var oauthOidcEntityGR = new GlideRecord('oauth_oidc_entity');
		oauthOidcEntityGR.initialize();
		oauthOidcEntityGR.setValue('name', 'google-chat-bot-oauth-consumer-' + groupName);
		oauthOidcEntityGR.setValue('default_grant_type', 'client_credentials');
		oauthOidcEntityGR.setValue('type', 'oauth_provider');
		oauthOidcEntityGR.setValue('oidc_provider_configuration', oidcProviderConfigSysId);
		var oauth_oidc_entity_sysId = oauthOidcEntityGR.insert();

		return oauth_oidc_entity_sysId;
	},

	createEntityProfile: function(oauthOidcEntitySysId) {
		var oauthEntityProfileSysId = null;
		var oauthEntityProfileGR = new GlideRecord('oauth_entity_profile');
		oauthEntityProfileGR.initialize();
		oauthEntityProfileGR.addQuery('oauth_entity', oauthOidcEntitySysId);
		oauthEntityProfileGR.query();
		if(!oauthEntityProfileGR.next()) {
			oauthEntityProfileGR.setValue('name', 'profile-for-' + oauthOidcEntitySysId);
			oauthEntityProfileGR.setValue('grant_type', 'client_credentials');
			oauthEntityProfileGR.setValue('oauth_entity', oauthOidcEntitySysId);
			oauthEntityProfileSysId = oauthEntityProfileGR.insert();
		} else {
			oauthEntityProfileSysId = oauthEntityProfileGR.sys_id;
		}

		return oauthEntityProfileSysId;
	},

	createJwt: function(oidcProviderConfigSysId, serviceAccountEmail, callbackURL) {
		var jwtValidationGR = new GlideRecord('jwt_claim_validation');
		jwtValidationGR.initialize();
		jwtValidationGR.addQuery('oidc_provider', oidcProviderConfigSysId);
		jwtValidationGR.query();
		if (!jwtValidationGR.next()) {
			this.jwtValidation('aud', oidcProviderConfigSysId, callbackURL);
			this.jwtValidation('iss', oidcProviderConfigSysId, 'https://accounts.google.com');
			this.jwtValidation('email', oidcProviderConfigSysId, serviceAccountEmail);
		}
	},

	createOrUpdateJwt: function(name, providerID, claimValue, nonStandard, valueType, isJwt) {
		var jwtValidationGR = new GlideRecord('jwt_claim_validation');
		jwtValidationGR.addQuery(isJwt ? 'jwt_provider' : 'oidc_provider', providerID);
		jwtValidationGR.addQuery('name', name);
		jwtValidationGR.query();
		if (!jwtValidationGR.next()) {
			this.jwtValidation(name, providerID, claimValue, nonStandard, valueType, isJwt);
		} else {
			jwtValidationGR.claim_value = claimValue;
			jwtValidationGR.update();
		}
	},

	jwtValidation: function(name, providerID, claimValue, nonStandard, valueType, isJwt) {
		var jwtValidationGR = new GlideRecord('jwt_claim_validation');
		jwtValidationGR.initialize();
		jwtValidationGR.setValue('is_standard_claim', !nonStandard);
		jwtValidationGR.setValue('claim_value_type', valueType ? valueType : 'string');
		jwtValidationGR.setValue('name', name);
		jwtValidationGR.setValue(isJwt ? 'jwt_provider' : 'oidc_provider', providerID);
		jwtValidationGR.setValue('claim_value', claimValue);
		return jwtValidationGR.insert();
	},

	createOidcTokenVerification: function(oauthOidcEntitySysId, botName) {
		var oidcTokenVerificationGR = new GlideRecord('oidc_token_verification');
		oidcTokenVerificationGR.initialize();
		oidcTokenVerificationGR.setValue('name', 'VA Google Chat Inbound Verification ' + botName);
		oidcTokenVerificationGR.setValue('oauth_oidc_entity', oauthOidcEntitySysId);
		return oidcTokenVerificationGR.insert();
	},

	createMessageAuth: function(botName, groupName, oidcTokenVerificationSysId, outboundCreationId) {
		var messageAuthGR = new GlideRecord('message_auth');
		messageAuthGR.initialize();
		messageAuthGR.setValue('name', 'VA Google Chat ' + botName);
		messageAuthGR.setValue('provider_name', 'Google');
		messageAuthGR.setValue('group_name', groupName);
		messageAuthGR.setValue('inbound_message_verification', oidcTokenVerificationSysId);
		messageAuthGR.setValue('outbound_message_creation', outboundCreationId)
		return messageAuthGR.insert();
	},

	createProviderApplication: function(botName, messageAuthSysId, inboundId, providerGRSysId) {
		var providerApplicationGR = new GlideRecord('sys_cs_provider_application');
		providerApplicationGR.initialize();
		providerApplicationGR.setValue('name', botName);
		providerApplicationGR.setValue('message_auth', messageAuthSysId);
		providerApplicationGR.setValue('inbound_id', inboundId);
		providerApplicationGR.setValue('provider', providerGRSysId);
		return providerApplicationGR.insert();
	},

	createOutboundCert: function(botName, keyStorePassword, keyStoreDataB64, notifyUserId) {
		var certRecord = new GlideRecord("sys_certificate");
		certRecord.initialize();
		certRecord.name = "Google Outbound Signing Certificate " + botName;
		certRecord.active = true;
		certRecord.type = "key_store";
		certRecord.format = "pem";
		certRecord.notify_on_expiration = notifyUserId;
		certRecord.setDisplayValue("key_store_password", keyStorePassword);
		var certId = certRecord.insert();

		var attachment = new Attachment();
		attachment.write(certRecord.getTableName(), certId, "google-bot-keystore.p12", "application/octet-stream", GlideStringUtil.base64DecodeAsBytes(keyStoreDataB64));
		return certId;
	},

	createOutboundCertWithAttachment: function(botName, keyStorePassword, attachementId, notifyUserId) {
		gs.info("Creating outputbound cert with attachement sys id : " + attachementId);
		var certRecord = new GlideRecord("sys_certificate");
		certRecord.initialize();
		certRecord.name = "Google Outbound Signing Certificate " + botName;
		certRecord.active = true;
		certRecord.type = "key_store";
		certRecord.format = "pem";
		certRecord.notify_on_expiration = notifyUserId;
		certRecord.setDisplayValue("key_store_password", keyStorePassword);
		var certId = certRecord.insert();

		var attachmentRecord = new GlideRecord("sys_attachment");
		attachmentRecord.get(attachementId);
		attachmentRecord.table_name = "sys_certificate";
		attachmentRecord.table_sys_id = certId;
		attachmentRecord.update();
		return certId;
	},

	createOutboundKeystoreAlias: function(botName, keyStorePassword, credentialId) {
		var jwtKeystoreAliasGr = new GlideRecord("jwt_keystore_aliases");
		jwtKeystoreAliasGr.initialize();
		jwtKeystoreAliasGr.name = "VA Google Outbound " + botName;
		jwtKeystoreAliasGr.signing_algorithm = "rsa_256";
		jwtKeystoreAliasGr.setDisplayValue("signing_key_password", keyStorePassword);
		jwtKeystoreAliasGr.signing_keystore = credentialId;

		return jwtKeystoreAliasGr.insert();
	},

	createOutboundJwtProvider: function(botName, keystoreId, issuerId) {
		var jwtProviderGr = new GlideRecord("jwt_provider");
		jwtProviderGr.initialize();
		jwtProviderGr.name = "VA Google Outbound " + botName;
		jwtProviderGr.expiry_interval = 60;
		jwtProviderGr.jwt_keystore_alias = keystoreId;
		var jwtProviderSysId = jwtProviderGr.insert();
		this.createOrUpdateJwt('aud', jwtProviderSysId, 'https://www.googleapis.com/oauth2/v4/token', true, 'string', true);
		this.createOrUpdateJwt('iss', jwtProviderSysId, issuerId, true, 'string', true);
		this.createOrUpdateJwt('scope', jwtProviderSysId, 'https://www.googleapis.com/auth/chat.bot', true, 'string', true);
		return jwtProviderSysId;
	},

	createOutboundOAuthEntityWithJWT: function(botName) {
		var oauthOidcEntityGr = new GlideRecord('oauth_entity');
		oauthOidcEntityGr.initialize();
		oauthOidcEntityGr.setValue('name', 'VA Google Chat Outbound OAuth Provider ' + botName);
		oauthOidcEntityGr.setValue('default_grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
		oauthOidcEntityGr.setValue('type', 'oauth_provider');
		oauthOidcEntityGr.setValue('token_url', 'https://www.googleapis.com/oauth2/v4/token');
		//This creates the default oauth_entity_profile record also
		var oauthOidcEntitySysId = oauthOidcEntityGr.insert();

		return oauthOidcEntitySysId;
	},

	createOutboundOAuthEntityWithClientCred: function(clientId, oidcConfigSysId) {
		var oauthOidcEntityGr = new GlideRecord('oauth_entity');
		oauthOidcEntityGr.initialize();
		oauthOidcEntityGr.setValue('name', 'VA Google Chat Outbound OAuth Provider ' + clientId);
		oauthOidcEntityGr.setValue('default_grant_type', 'client_credentials');
		oauthOidcEntityGr.setValue('client_id', clientId);
		oauthOidcEntityGr.setValue('oidc_provider_configuration', oidcConfigSysId);
		oauthOidcEntityGr.setValue('type', 'oauth_provider');
		oauthOidcEntityGr.setValue('token_url', 'https://www.googleapis.com/oauth2/v4/token');
		//This creates the default oauth_entity_profile record also
		return oauthOidcEntityGr.insert();
	},

	updateOutboundOAuthEntityProfile: function(oauthProviderId, jwtProviderId) {
		var oauthEntityProfileGr = new GlideRecord('oauth_entity_profile');
		oauthEntityProfileGr.addQuery('oauth_entity', oauthProviderId);
		oauthEntityProfileGr.query();
		if (oauthEntityProfileGr.next()) {
			oauthEntityProfileGr.jwt_provider = jwtProviderId;
			oauthEntityProfileGr.update();
			return oauthEntityProfileGr.getUniqueValue();
		} else {
			return null;
		}
	},

	createOutboundVerification: function(botName, oauthEntityProfileId) {
		var oauthEntityProfileVerififcationGr = new GlideRecord('oauth_entity_profile_verification');
		oauthEntityProfileVerififcationGr.initialize();
		oauthEntityProfileVerififcationGr.name = "VA Google Chat Outbound Verification " + botName;
		oauthEntityProfileVerififcationGr.oauth_entity_profile = oauthEntityProfileId;
		return oauthEntityProfileVerififcationGr.insert();
	},

	createOutboundRecords: function(botName, keyStorePassword, keyStoreDataB64, notifyUserId, issuerId) {
		var cId = this.createOutboundCert(botName, keyStorePassword, keyStoreDataB64, notifyUserId);
		var aId = this.createOutboundKeystoreAlias(botName, keyStorePassword, cId);
		var jpId = this.createOutboundJwtProvider(botName, aId, issuerId);
		var oId = this.createOutboundOAuthEntityWithJWT(botName);
		var oepId = this.updateOutboundOAuthEntityProfile(oId, jpId);
		this.createOutboundVerification(botName, oepId);
	},

	createOutboundRecordsWithAttachment: function(botName, keyStorePassword, keyAttachmentId, notifyUserId, issuerId) {
		var cId = this.createOutboundCertWithAttachment(botName, keyStorePassword, keyAttachmentId, notifyUserId);
		var aId = this.createOutboundKeystoreAlias(botName, keyStorePassword, cId);
		var jpId = this.createOutboundJwtProvider(botName, aId, issuerId);
		var oId = this.createOutboundOAuthEntityWithJWT(botName);
		var oepId = this.updateOutboundOAuthEntityProfile(oId, jpId);
		this.createOutboundVerification(botName, oepId);
	},

	createOutboundTokenVerification: function(id, token) {
		var tokenVerificationGR = new GlideRecord('token_verification');
		tokenVerificationGR.initialize();
		tokenVerificationGR.setValue('name', "VA Google Chat Outbound token Verification " + id);
		tokenVerificationGR.setValue('token', token);
		return tokenVerificationGR.insert();
	},

	/**
	 * Creates or updates custom adapter property records for Google Service URLs
	 * @param {boolean} isProdBot - Flag to determine if this is a production bot
	 * @param {string} providerChannelIdentityId - The provider channel identity ID
	 * @param {string} serviceUrl - The Google service URL value
	 * @param {string} originServiceUrl - The Google origin service URL value
	 * @returns {boolean} True if all inserts/updates were successful, false otherwise
	 */
	createCustomAdapterProperties: function(isProdBot, providerChannelIdentityId, domainId) {
		if (!providerChannelIdentityId) {
			return false;
		}
		var urlConfigs;
		if (isProdBot) {
			urlConfigs = [
				{name: 'google_service_url', value: 'https://googleproxy.servicenowlab.com/google/va/outbound'},
				{name: 'google_origin_service_url', value: 'https://chat.googleapis.com'},
				{name: 'google_domain_id', value: domainId}
			];
		} else {
			urlConfigs = [
				{name: 'google_service_url', value: 'https://chat.googleapis.com'}
			];
		}
		for (var i = 0; i < urlConfigs.length; i++) {
			var config = urlConfigs[i];
			var gr = new GlideRecord('sys_cs_custom_adapter_property');
			gr.addQuery('document_record', providerChannelIdentityId);
			gr.addQuery('document_table', 'sys_cs_provider_application');
			gr.addQuery('name', config.name);
			gr.query();

			if (gr.next()) {
				gr.setValue('value', config.value);
				if (!gr.update()) {
					return false;
				}
			} else {
				gr.initialize();
				gr.setValue('document_record', providerChannelIdentityId);
				gr.setValue('document_table', 'sys_cs_provider_application');
				gr.setValue('name', config.name);
				gr.setValue('value', config.value);
				gr.setValue('description', config.name + ' for VA Google Chat ServiceNow Virtual Agent Google Chat App');
				if (!gr.insert()) {
					return false;
				}
			}
		}
		return true;
	},
	
	/**
	 * Gets existing custom adapter property records for Google Service URLs
	 * @param {boolean} isProdBot - Flag to determine if this is a production bot
	 * @param {string} providerChannelIdentityId - The provider channel identity ID
	 * @returns {array} Array of objects containing name and value pairs
	 */
	getCustomAdapterPropertiesWithInboundId: function(isProdBot, inboundId) {
		var providerChannelIdentityId;
		var result = [];
		var providerChannelIdentityGr = new GlideRecord('sys_cs_provider_application');
		providerChannelIdentityGr.addQuery('inbound_id', inboundId);
		providerChannelIdentityGr.query();
		if (providerChannelIdentityGr.next()) {
			providerChannelIdentityId = providerChannelIdentityGr.getUniqueValue();
			if (!providerChannelIdentityId) {
				return result;
			}
			var names = isProdBot ? ['google_service_url', 'google_origin_service_url', 'google_domain_id'] : ['google_service_url'];
			var gr = new GlideRecord('sys_cs_custom_adapter_property');
			gr.addQuery('document_record', providerChannelIdentityId);
			gr.addQuery('document_table', 'sys_cs_provider_application');
			gr.addQuery('name', 'IN', names.join(','));
			gr.query();
			while (gr.next()) {
				result.push({
					name: gr.getValue('name'),
					value: gr.getValue('value')
				});
			}
		}
		return result;
	},
	type: 'VAGoogleInstanceBot'
};
