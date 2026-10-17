            
var GoogleSheetListExport = Class.create();
GoogleSheetListExport.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	/**
	 * getGoogleSheetId
	 * Description: Triggers google_sheet_list_subflow and returns an id of the sheet if successful
	 * @param {String} inputs - {attachement sys_id, aliasId, file name}
	 * @returns {Object} Contains id of the sheet with exported data or error object with code and a message
	 */

	getGoogleSheetId: function(attachmentId, inputFileName) {
		var attachmentSysId = attachmentId || this.getParameter('sysparm_sysid');
		var fileName = inputFileName || this.getParameter('sysparm_filename');
		var aliasId = gs.getProperty('glide.oauth.export.to.sheets.alias');

		var attachmentGR = new GlideRecord('sys_attachment');
		var gsa = new GlideSysAttachment();
		var attachmentDataAsString;

		try {
			if (attachmentGR.get(attachmentSysId)) {
				var gsa = GlideSysAttachmentInputStream(attachmentGR.sys_id.toString());
				var baos = new Packages.java.io.ByteArrayOutputStream();
				gsa.writeTo(baos);
				baos.close();
				var bytesInFile = baos.toByteArray();
				var dataAsString = Packages.java.lang.String(bytesInFile);
				attachmentDataAsString = String(dataAsString);
			} else {
				var errorMsg = gs.getMessage('Could not find record in sys_attachment table with id {0}', inputs['attachmentid']);
				gs.error(errorMsg);
			}
		} catch (e) {
			gs.error(e.message);
			var errorObject = {
				code: 1,
				message: e.message
			};
			var result = {
				errorObject: errorObject
			};
			return JSON.stringify(result);
		}

		var input = {};
		input['aliasid'] = aliasId;
		input['attachment_content'] = attachmentDataAsString;
		input['table_name'] = fileName;

		var result = sn_fd.FlowAPI.getRunner().subflow('sn_now_list_common.google_sheet_list_subflow').withInputs(input).inForeground().run();
		var outputs = result.getOutputs();
		var response = JSON.parse(outputs.output);
		var errorObject = outputs.error_object;
		var outputResult = {
			response: response,
			errorObject: errorObject
		};

		return JSON.stringify(outputResult);
	},

	/**
	 * getTokenDetails
	 * Description: returns if a user had a valid access token, refresh token, expiry data
	 * @returns {Object}  returns a object with validity of access token, refresh token, expiry data
	 */

	getTokenDetails: function() {
		var resultObj = {};
		var oAuthPropertiesJson = this.getOAuthProperties();
		if (!oAuthPropertiesJson) {
			gs.warn("No Connection/Credential Alias found for Google Sheet Export");
			return {};
		}
		var credentialSysId = oAuthPropertiesJson.credentialSysId;
		var oAuthEntityProfile = oAuthPropertiesJson.oAuthEntityProfile;

		// Check to see if use has an OAuth Token
		var oAuthClient = new sn_auth.GlideOAuthClient();
		oAuthClient.setPersonal(true); // setPersonal to true will return tokens for logged in user
		var oAuthToken = oAuthClient.getToken(credentialSysId, oAuthEntityProfile);
		if (oAuthToken) {
			if (oAuthToken.getAccessToken()) {
				gs.log('OAuth Access token is available, credential=' + credentialSysId + ', oauth_profile_id=' + oAuthEntityProfile);
				resultObj.isToken = true;
				resultObj.tokenExpiresInSecs = oAuthToken.getExpiresIn();
				var tokenExpiresInMs = new GlideTime(oAuthToken.getExpiresIn() * 1000);
				var tokenExpiresOnDate = new GlideDateTime();
				tokenExpiresOnDate.add(tokenExpiresInMs);
				resultObj.tokenExpiresOnDate = tokenExpiresOnDate.getDisplayValue();
			} else {
				resultObj.isToken = false;
			}

			if (oAuthToken.getRefreshToken()) {
				gs.log('OAuth Refresh token is available, requestor=' + credentialSysId + ', oauth_profile_id=' + oAuthEntityProfile);
				resultObj.isRefreshToken = true;
				resultObj.refreshTokenExpiresInSecs = oAuthToken.getRefreshTokenExpiresIn();

				var refreshExpiresInMs = new GlideTime(oAuthToken.getRefreshTokenExpiresIn() * 1000);
				var refreshExpiresOnDate = new GlideDateTime();
				refreshExpiresOnDate.add(refreshExpiresInMs);
				resultObj.refreshTokenExpiresOnDate = refreshExpiresOnDate.getDisplayValue();
			} else {
				resultObj.isRefreshToken = false;
			}
		} else {
			resultObj.isToken = false;
			resultObj.isRefreshToken = false;
		}

		resultObj.credSysId = credentialSysId;
		resultObj.oAuthSysId = oAuthEntityProfile;

		return JSON.stringify(resultObj);
	},

	/**
	 * getOAuthProperties
	 * Description: Get Oauth profileId and crendential sysId tied to the alias record
	 * @returns {Object} Return object containing profileId and crendential sysId tied to the alias record
	 */

	getOAuthProperties: function() {
		var aliasId = gs.getProperty('glide.oauth.export.to.sheets.alias');
		var credConnAliasGR = new GlideRecord("sys_alias");
		if (!credConnAliasGR.get(aliasId)) {
			gs.warn("No Connection/Credential Alias found for Google Sheet Export");
			return false;
		}

		var connectionGR = new GlideRecord("http_connection");
		connectionGR.addQuery("connection_alias", credConnAliasGR.getUniqueValue());
		connectionGR.query();
		if (!connectionGR.next()) { // Should only be one connection configured
			gs.warn("No Connection assigned to Connection/Credential found for Google Sheet Export");
			return false;
		}

		var credentialSysId = connectionGR.getValue("credential");
		if (gs.nil(credentialSysId)) {
			gs.warn("No Credentials assigned to Connection for Google Sheet Export");
			return false;
		}

		var oAuthEntityProfile = connectionGR.credential.oauth_entity_profile.sys_id.toString();
		if (gs.nil(oAuthEntityProfile)) {
			gs.warn("No OAuth Entity Profile assigned to Credentials for Google Sheet Export");
			return false;
		}

		var oAuthObject = {
			credentialSysId: credentialSysId,
			oAuthEntityProfile: oAuthEntityProfile
		};

		return oAuthObject;
	},

	type: 'GoogleSheetListExport'
});
