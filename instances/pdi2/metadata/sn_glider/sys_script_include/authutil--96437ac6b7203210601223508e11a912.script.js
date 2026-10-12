var AuthUtil = Class.create();
AuthUtil.prototype = {
	initialize: function () {},

	/**
	 * Error codes for standardized error handling
	 */
	ERROR_CODES: {
		INVALID_REQUEST: 'INVALID_REQUEST',
		MISSING_PARAMETER: 'MISSING_PARAMETER',
		NOT_FOUND: 'NOT_FOUND',
		INVALID_AUTH_TYPE: 'INVALID_AUTH_TYPE',
		OAUTH_PROFILE_NOT_FOUND: 'OAUTH_PROFILE_NOT_FOUND',
		CREDENTIAL_NOT_FOUND: 'CREDENTIAL_NOT_FOUND',
		TOKEN_RETRIEVAL_ERROR: 'TOKEN_RETRIEVAL_ERROR',
		INTERNAL_ERROR: 'INTERNAL_ERROR'
	},

	/**
	 * Creates a standardized error object with code and message
	 * @param {string} code - Error code from ERROR_CODES
	 * @param {string} message - Error message
	 * @param {number} [httpStatus=500] - HTTP status code
	 * @returns {Error} Error object with code and httpStatus properties
	 * @private
	 */
	_createError: function (code, message, httpStatus) {
		var error = new Error(message);
		error.code = code;
		error.httpStatus = httpStatus || 500;
		return error;
	},

	/**
	 * Saves a credential based on the auth type and returns the appropriate response.
	 * Reuses createBasicAuthCredential and createOAuthCredential from IDEGlobalUtils.
	 * @param {Object} request - The sign-in request object
	 * @param {string} request.providerId - The ID of the authentication provider
	 * @param {string} request.authType - The type of authentication (e.g., 'basic', 'oauth', 'api-key')
	 * @param {Object} request.payload - The authentication payload
	 * @param {string} [request.payload.username] - The username (for BasicAuth)
	 * @param {string} [request.payload.password] - The password (for BasicAuth)
	 * @param {string} [request.payload.apiKey] - The API key (for APIKey)
	 * @param {string[]} [request.payload.scopes] - The OAuth scopes (for OAuth)
	 * @returns {Object} The sign-in response object containing token or authorization URL
	 * @throws {Error} If the authentication type is invalid or required parameters are missing
	 */
	saveCredential: function (request) {
		if (!request || !request.providerId || !request.authType || !request.payload) {
			throw this._createError(
				this.ERROR_CODES.MISSING_PARAMETER,
				sn_i18n.Message.getMessage(
					'sn_glider.auth.error.missing_parameters',
					'Missing required parameters: providerId, authType, and payload are required'
				),
				400
			);
		}

		var response = {};
		var providerId = request.providerId;
		var authType = request.authType;
		var payload = request.payload;
		var scopes = payload.scopes || [];

		var ideGlobalUtils = new global.IDEGlobalUtils();

		var remoteResource = this._generateRemoteResourceName(providerId, scopes);
		var newCredentialName = this._generateCredentialName(authType, providerId);

		switch (authType) {
			case 'basic':
				this._deactivateExistingCredential(remoteResource);
				var basicAuthSysId = ideGlobalUtils.createBasicAuthCredential(payload.username, payload.password, newCredentialName);
				this._createIdeAuthCredentialRecord(basicAuthSysId, 'basic_auth_credentials', remoteResource, newCredentialName);
				response = {
					token: payload.password
				};
				break;

			case 'oauth':
				var existingOAuthCredential = null;
				try {
					existingOAuthCredential = this.getToken({
						providerId: providerId,
						scopes: scopes
					});
				} catch (error) {
					this._log('Existing credential not found during signin', 'info');
				}

				if (existingOAuthCredential && existingOAuthCredential.token) {
					response = existingOAuthCredential;
				} else {
					this._deactivateExistingCredential(remoteResource);
					var oauthEntityProfileSysId = this._getOauthEntityProfileSysId(providerId);
					if (!oauthEntityProfileSysId) {
						throw this._createError(
							this.ERROR_CODES.OAUTH_ERROR,
							sn_i18n.Message.getMessage('sn_glider.auth.error.oauth_profile_not_found', 'OAuth profile not found for provider: {providerId}', {
								providerId: providerId
							}),
							404
						);
					}
					var oAuthSysId = ideGlobalUtils.createOAuthCredential('', oauthEntityProfileSysId, newCredentialName);
					this._createIdeAuthCredentialRecord(oAuthSysId, 'oauth_2_0_credentials', remoteResource, newCredentialName);
					response = {
						authorizationURL: this._getOAuthInitiatorUrl(oAuthSysId, oauthEntityProfileSysId, payload.scopes)
					};
				}
				break;
			case 'api-key':
				this._deactivateExistingCredential(remoteResource);
				var basicAuthForAPIKeySysId = ideGlobalUtils.createBasicAuthCredential('', payload.apiKey, newCredentialName);
				this._createIdeAuthCredentialRecord(basicAuthForAPIKeySysId, 'basic_auth_credentials', remoteResource, newCredentialName);
				response = {
					token: payload.apiKey
				};
				break;

			default:
				throw this._createError(
					this.ERROR_CODES.INVALID_REQUEST,
					sn_i18n.Message.getMessage('sn_glider.auth.error.invalid_auth_type', 'Invalid auth type: {authType}', { authType: authType }),
					400
				);
		}

		return response;
	},

	/**
	 * Retrieves an authentication token for the specified provider and scopes.
	 * For OAuth tokens, automatically handles token refresh if needed.
	 * @param {Object} request - The token request object
	 * @param {string} request.providerId - The ID of the authentication provider
	 * @param {string[]} [request.scopes] - Optional array of OAuth scopes
	 * @returns {Object} The token response object
	 * @property {string} token - The authentication token
	 * @property {string} [expiresAt] - The token expiration time (for OAuth)
	 * @throws {Error} If no active credential is found for the provider and scopes
	 */
	getToken: function (request) {
		if (!request || !request.providerId) {
			throw this._createError(
				this.ERROR_CODES.MISSING_PARAMETER,
				sn_i18n.Message.getMessage('sn_glider.auth.error.missing_requester_id', 'Missing required parameter: providerId'),
				400
			);
		}

		var response = {};
		var providerId = request.providerId;
		var scopes = request.scopes || [];

		var remoteResource = this._generateRemoteResourceName(providerId, scopes);
		var credential = this._getIdeAuthCredential(remoteResource);
		if (!credential) {
			throw this._createError(
				this.ERROR_CODES.CREDENTIAL_NOT_FOUND,
				sn_i18n.Message.getMessage('sn_glider.auth.error.credential_not_found', 'No active credential found for provider: {providerId}', {
					providerId: providerId
				}),
				404
			);
		}

		if (credential.auth_credential_table === 'basic_auth_credentials') {
			var basicAuthCred = this._getBasicAuthCredential(credential.auth_credential);
			if (basicAuthCred) {
				response = {
					token: basicAuthCred.password,
					type: 'basic'
				};
			}
		} else if (credential.auth_credential_table === 'oauth_2_0_credentials') {
			var oauthCredential = this._getOAuthCredential(credential.auth_credential_oauth);
			if (oauthCredential) {
				response = {
					token: oauthCredential.token,
					type: 'oauth'
				};
				if (oauthCredential.expiresAt) {
					response.expiresAt = oauthCredential.expiresAt;
				}
			}
		}

		if (!response.token) {
			throw this._createError(
				this.ERROR_CODES.TOKEN_RETRIEVAL_ERROR,
				sn_i18n.Message.getMessage('sn_glider.auth.error.token_retrieval_failed', 'Failed to retrieve valid token for provider: {providerId}', {
					providerId: providerId
				}),
				500
			);
		}

		return response;
	},

	/* ---------------------------- Private methods ---------------------------- */
	/* These methods are internal to the implementation and should not be called directly. */
	/* ------------------------------------------------------------------------- */

	/**
	 * Retrieves basic auth credentials using StandardCredentialsProvider.
	 * @param {string} credentialId - The sys_id of the basic auth credential
	 * @returns {Object|null} Object containing username and password, or null if not found or invalid
	 * @throws {Error} If the password is not encrypted
	 * @private
	 */
	_getBasicAuthCredential: function (credentialId) {
		try {
			var provider = new sn_cc.StandardCredentialsProvider();
			var credential = provider.getCredentialByID(credentialId);
			if (!credential) return null;

			var username = credential.getAttribute('user_name');
			var password = credential.getAttribute('password');

			if (this._isPasswordInPlainText(credentialId, password)) {
				throw new Error('Password not encrypted.');
			}

			return {
				username: username,
				password: password
			};
		} catch (error) {
			// Captures errors from CredentialsProvider as well as ones due to use of plain text.
			this._log('Error getting basic auth credential: ' + error, 'error');
			this._deleteBasicAuthCredentialIfExists(credentialId);
			return null;
		}
	},

	/**
	 * Deletes a basic auth credential if it exists.
	 * @param {string} basicAuthCredentialSysId - The credential ID to delete
	 * @private
	 */
	_deleteBasicAuthCredentialIfExists: function (basicAuthCredentialSysId) {
		var gr = new GlideRecord('basic_auth_credentials');
		if (basicAuthCredentialSysId && gr.get(basicAuthCredentialSysId)) {
			this._log('Deleting basic auth credential ' + basicAuthCredentialSysId, 'info');
			gr.deleteRecord();
		}
	},

	/**
	 * Compares basic auth password value with its decrypted value
	 * @param {string} basicAuthCredentialSysId - The credential ID
	 * @param {string} decryptedValue - The decrypted password value to check
	 * @returns {boolean} True if password is in plain text, false otherwise
	 * @private
	 */
	_isPasswordInPlainText: function (basicAuthCredentialSysId, decryptedValue) {
		var gr = new GlideRecord('basic_auth_credentials');
		if (basicAuthCredentialSysId && gr.get(basicAuthCredentialSysId)) {
			return gr.password == decryptedValue;
		}
		return false;
	},

	/**
	 * Retrieves OAuth credentials using StandardCredentialsProvider and handles token refresh
	 * @param {string} oAuthCredentialId - The sys_id of the OAuth credential
	 * @returns {Object|null} Object containing token and expiresAt, or null if not found or invalid
	 * @private
	 */
	_getOAuthCredential: function (oAuthCredentialId) {
		try {
			var oAuthProfileId = this._getOAuthProfileId(oAuthCredentialId);
			if (!oAuthProfileId) {
				return null;
			}

			// Get the token once and use it for both access token and expiration
			var tokenInfo = this._getAccessTokenWithExpiration(oAuthCredentialId, oAuthProfileId);
			if (!tokenInfo || !tokenInfo.token) {
				return null;
			}

			return tokenInfo;
		} catch (error) {
			this._log('Error getting OAuth credential: ' + error, 'error');
			return null;
		}
	},

	/**
	 * Retrieves the OAuth entity profile sys_id for a given provider ID.
	 * @param {string} providerId - The provider ID to search for
	 * @returns {string|null} The sys_id of the matching OAuth entity profile, or null if not found
	 * @private
	 */
	_getOauthEntityProfileSysId: function (providerId) {
		if (!providerId) {
			this._log('Provider ID is required to get OAuth entity profile', 'warn');
			return null;
		}

		try {
			var gr = new GlideRecord('oauth_entity_profile');
			gr.addQuery('name', 'STARTSWITH', providerId);
			gr.setLimit(1);
			gr.query();

			if (gr.next()) {
				this._log('Found OAuth entity profile: ' + gr.name + ' (' + gr.sys_id + ')');
				return gr.sys_id.toString();
			}

			this._log('No OAuth entity profile found for provider: ' + providerId, 'warn');
			return null;
		} catch (error) {
			this._log('Error getting OAuth entity profile: ' + error, 'error');
			return null;
		}
	},

	/**
	 * Gets an OAuth access token with its expiration information
	 * @param {string} oAuthRequestorId - The OAuth requestor ID (credential ID)
	 * @param {string} oAuthProfileId - The OAuth profile ID
	 * @returns {Object|null} Object containing token and expiresAt, or null if not available
	 * @private
	 */
	_getAccessTokenWithExpiration: function (oAuthRequestorId, oAuthProfileId) {
		var bufferTimeBeforeTokenExpires = parseInt(gs.getProperty('sn_glider.oauth.token.expiry.buffer', 30)); // 30 seconds
		var oAuthClient = new sn_auth.GlideOAuthClient();
		oAuthClient.setPersonal(true);

		// Get the token object which contains expiration information
		var token = oAuthClient.getToken(oAuthRequestorId, oAuthProfileId);
		if (!token) {
			return null;
		}

		var accessToken;
		var expiresAt;

		if (token.getExpiresIn() >= bufferTimeBeforeTokenExpires) {
			// If access token exists and is not expired, use it
			accessToken = token.getAccessToken();

			// Calculate expiration time
			if (token.getExpiresIn() > 0) {
				var expiresInMs = token.getExpiresIn() * 1000; // Convert to milliseconds
				var expiresDate = new GlideDateTime();
				expiresDate.add(expiresInMs);
				expiresAt = expiresDate.getDisplayValue();
			}
		} else if (token.getRefreshToken() && token.getRefreshTokenExpiresIn() >= bufferTimeBeforeTokenExpires) {
			// If refresh token exists and is not expired, use it to generate new access token
			var newToken = this._refreshAccessToken(oAuthRequestorId, oAuthProfileId, token.getRefreshToken());
			if (newToken) {
				accessToken = newToken.getAccessToken();
				// For new tokens, the expiration is typically 1 hour from now
				var newExpiresDate = new GlideDateTime();
				newExpiresDate.add(3600000); // 1 hour in milliseconds
				expiresAt = newExpiresDate.getDisplayValue();
			}
		}

		if (!accessToken) {
			return null;
		}

		var result = {
			token: accessToken
		};
		if (expiresAt) {
			result.expiresAt = expiresAt;
		}

		return result;
	},

	/**
	 * Gets the OAuth profile ID for a given OAuth credential
	 * @param {string} oAuthCredentialId - The sys_id of the OAuth credential
	 * @returns {string|null} The OAuth profile ID or null if not found
	 * @private
	 */
	_getOAuthProfileId: function (oAuthCredentialId) {
		if (!oAuthCredentialId) {
			this._log('OAuth credential ID is required to get profile ID', 'warn');
			return null;
		}
		var gr = new GlideRecord('oauth_2_0_credentials');
		if (gr.get(oAuthCredentialId)) {
			return gr.oauth_entity_profile.toString();
		}
		this._log('OAuth Credential does not exist. ID: ' + oAuthCredentialId, 'warn');
		return null;
	},

	/**
	 * Gets an OAuth access token, refreshing it if necessary
	 * @param {string} oAuthRequestorId - The OAuth requestor ID (credential ID)
	 * @param {string} oAuthProfileId - The OAuth profile ID
	 * @returns {string} The access token or empty string if not available
	 * @private
	 */
	_getAccessToken: function (oAuthRequestorId, oAuthProfileId) {
		var bufferTimeBeforeTokenExpires = parseInt(gs.getProperty('sn_glider.oauth.token.expiry.buffer', 30)); // 30 seconds

		var oAuthClient = new sn_auth.GlideOAuthClient();
		oAuthClient.setPersonal(true); // setPersonal to true will return tokens for logged in user
		var token = oAuthClient.getToken(oAuthRequestorId, oAuthProfileId);

		if (token && token.getExpiresIn() >= bufferTimeBeforeTokenExpires) {
			// If access token exists and is not expired, use it
			return token.getAccessToken();
		} else if (token && token.getRefreshToken() && token.getRefreshTokenExpiresIn() >= bufferTimeBeforeTokenExpires) {
			// If refresh token exists and is not expired, use it to generate new access token
			var newToken = this._refreshAccessToken(oAuthRequestorId, oAuthProfileId, token.getRefreshToken());
			if (newToken) {
				return newToken.getAccessToken();
			}
		}

		return '';
	},

	/**
	 * Refreshes an OAuth access token using a refresh token
	 * @param {string} oAuthRequestorId - The OAuth requestor ID (credential ID)
	 * @param {string} oAuthProfileId - The OAuth profile ID
	 * @param {string} refreshToken - The refresh token
	 * @returns {Object|null} The new token object or null if refresh failed
	 * @private
	 */
	_refreshAccessToken: function (oAuthRequestorId, oAuthProfileId, refreshToken) {
		if (!(refreshToken && oAuthRequestorId && oAuthProfileId)) {
			return null;
		}

		try {
			var tokenRequest = new sn_auth.GlideOAuthClientRequest();
			tokenRequest.setGrantType('refresh_token');
			tokenRequest.setRefreshToken(refreshToken);
			tokenRequest.setParameter('oauth_requestor_context', 'oauth_2_0_credentials');
			tokenRequest.setParameter('oauth_requestor', oAuthRequestorId);
			tokenRequest.setParameter('oauth_provider_profile', oAuthProfileId);

			var oAuthClient = new sn_auth.GlideOAuthClient();
			oAuthClient.setPersonal(true);
			var tokenResponse = oAuthClient.requestTokenByRequest(null, tokenRequest);

			var error = tokenResponse.getErrorMessage();
			if (error) {
				this._log('Error refreshing OAuth token: ' + error, 'error');
				return null;
			}

			return tokenResponse.getToken();
		} catch (error) {
			this._log('Exception while refreshing OAuth token: ' + error, 'error');
			return null;
		}
	},

	/**
	 * Generates a remote resource name
	 * @param {String} providerId
	 * @param {String[]} scopes
	 */
	_generateRemoteResourceName: function (providerId, scopes) {
		return providerId + (scopes.length > 0 ? '_' + scopes.join('_') : '');
	},

	/**
	 * Generates a unique credential name.
	 * @param {String} authType
	 * @param {String} providerId
	 * @returns {String}
	 */
	_generateCredentialName: function (authType, providerId) {
		var prefix = authType;

		return [prefix, gs.getUserName(), providerId, new Date().getTime()].join('_').substring(0, 40);
	},

	/**
	 * Deactivates any existing active credentials for the remoteResource.
	 * @param {String} remoteResource
	 */
	_deactivateExistingCredential: function (remoteResource) {
		var gr = new GlideRecord('sn_glider_ide_git_credential');
		gr.addQuery('user', gs.getUserID());
		gr.addQuery('remote_resource', remoteResource);
		gr.addQuery('active', true);
		gr.query();
		while (gr.next()) {
			gr.active = false;
			gr.update();
		}
	},

	/**
	 * Creates a new IDE auth credential record.
	 * @param {String} authCredentialSysId
	 * @param {String} authCredentialTable
	 * @param {String} remoteResource
	 * @param {String} newCredentialName
	 * @returns {String} sys_id of the created record
	 */
	_createIdeAuthCredentialRecord: function (authCredentialSysId, authCredentialTable, remoteResource, newCredentialName) {
		var gr = new GlideRecord('sn_glider_ide_git_credential');
		gr.initialize();
		gr.active = true;
		if (authCredentialTable === 'basic_auth_credentials') gr.auth_credential = authCredentialSysId;
		else if (authCredentialTable === 'oauth_2_0_credentials') gr.auth_credential_oauth = authCredentialSysId;
		else return null;
		gr.auth_credential_table = authCredentialTable;
		gr.remote_resource = remoteResource;
		gr.user = gs.getUserID();
		gr.name = newCredentialName;

		return gr.insert();
	},

	/**
	 * Retrieves the active IDE auth credential for a remoteResource.
	 * @param {String} remoteResource
	 * @param {String} userId (optional)
	 * @returns {Object|null} {sys_id, auth_credential_table, auth_credential, auth_credential_oauth}
	 */
	_getIdeAuthCredential: function (remoteResource, userId) {
		var glideUserId = userId || gs.getUserID();
		var gr = new GlideRecord('sn_glider_ide_git_credential');
		gr.addQuery('user', glideUserId);
		gr.addQuery('remote_resource', remoteResource);
		gr.addQuery('active', true);
		gr.query();
		if (gr.next()) {
			return {
				sys_id: gr.getUniqueValue(),
				auth_credential_table: gr.getValue('auth_credential_table'),
				auth_credential: gr.getValue('auth_credential'),
				auth_credential_oauth: gr.getValue('auth_credential_oauth')
			};
		}

		return null;
	},

	/**
	 * Gets the OAuth initiator URL for starting the OAuth flow.
	 * @param {String} oAuthRequestorId
	 * @param {String} oauthProfileId
	 * @param {String[]} scopes - Additional scopes requested by the client
	 * @returns {String} URL
	 */
	_getOAuthInitiatorUrl: function (oAuthRequestorId, oauthProfileId, scopes) {
		var oauthRequestorContext = 'oauth_2_0_credentials';

		var profileScopes = this._getProfileScopes(oauthProfileId);
		var clientScopes = scopes && scopes.length ? scopes : [];
		var scopeSet = new Set(profileScopes.concat(clientScopes));
		var allScopes = Array.from(scopeSet);

		var params = {
			oauth_requestor_context: oauthRequestorContext,
			oauth_requestor: oAuthRequestorId,
			oauth_provider_profile: oauthProfileId,
			response_type: 'code',
			personal: true,
			scope: allScopes.length > 0 ? allScopes.join(' ') : ''
		};

		var url =
			'/oauth_initiator.do?' +
			Object.keys(params)
				.map(function (key) {
					return key + '=' + encodeURIComponent(params[key]);
				})
				.join('&');

		return url;
	},

	/**
	 * Retrieves all scopes from the oauth_entity_profile_scope table for a given profile ID.
	 * @param {String} oauthProfileId - The OAuth entity profile sys_id
	 * @returns {String[]} Array of scope strings
	 * @private
	 */
	_getProfileScopes: function (oauthProfileId) {
		if (!oauthProfileId) {
			this._log('OAuth profile ID is required to get profile scopes', 'warn');
			return [];
		}

		try {
			var scopes = [];
			var gr = new GlideRecord('oauth_entity_profile_scope');
			gr.addQuery('oauth_entity_profile', oauthProfileId);
			gr.query();

			while (gr.next()) {
				var scopeGr = new GlideRecord('oauth_entity_scope');
				if (scopeGr.get(gr.oauth_entity_scope)) {
					var scopeValue = scopeGr.getValue('oauth_entity_scope');
					if (scopeValue) {
						scopes.push(scopeValue);
					}
				}
			}

			return scopes;
		} catch (error) {
			this._log('Error getting OAuth profile scopes: ' + error, 'error');
			return [];
		}
	},

	/**
	 * Logs a message with the specified log level.
	 * @param {string} message - The message to log
	 * @param {string} [type='info'] - The log level ('info', 'warn', or 'error')
	 * @private
	 */
	_log: function (message, type) {
		var prefix = '[IDE] [Auth] ';
		switch (type) {
			case 'warn':
				gs.warn(prefix + message);
				break;
			case 'error':
				gs.error(prefix + message);
				break;
			case 'info':
			default:
				gs.info(prefix + message);
				break;
		}
	},

	type: 'AuthUtil'
};
