var WhatsNewAPIHandlerSNC = Class.create();
WhatsNewAPIHandlerSNC.prototype = {
	initialize: function() {
		this.whatsNewUtil = new sn_wn.WhatsNewUtil();
	},

	restResponseOk: {
		status: WhatsNewCommonConstants.HTTP_RESPONSE_STATUS_CODE_OK,
		message: WhatsNewCommonConstants.RECORD_INSERTED_SUCCESSFULLY
	},

	restResponseInvalid: {
		status: WhatsNewCommonConstants.HTTP_RESPONSE_STATUS_CODE_BAD_REQUEST,
		message: WhatsNewCommonConstants.INVALID_REQUEST_PAYLOAD
	},

	restResponseConflict: {
		status: WhatsNewCommonConstants.HTTP_RESPONSE_STATUS_CODE_CONFLICT,
		message: WhatsNewCommonConstants.RECORD_ALREADY_EXISTS
	},

	restResponseNotFound: {
		status: WhatsNewCommonConstants.HTTP_RESPONSE_STATUS_CODE_NOT_FOUND,
	},

	handleTotalContentCountRequest: function(payload) {
		var res = {
			total: 0,
			status: 200
		};
		var referringURL = decodeURIComponent(payload.referringURL + "");
		if(gs.nil(referringURL))
			return this.restResponseInvalid;
		var appConfig = this._getAppConfig(referringURL),
			cnt=0;
		if (!appConfig.sysId)
			return res;
		var appConfigContentGR = this._getConfigContentRecords(appConfig.sysId);
		while(appConfigContentGR.next())
			cnt++;
		res.total = cnt;
		return res;
	},

	handleMenuPageRequest: function(payload) {
		var res = {
			menuPage : {
				appConfigSysId: "",
				content: [],
				limit: parseInt(gs.getProperty("sn_wn.whats_new.ui.menu_content_count", 4)),
				message: "",
				referringURL: "",
				shortDescription: "",
				status: 200,
				title: "",
				total: 0
			},
			showWnTab: false,
			newContentAvailable: false,
			defaultHelpTab: (gs.getProperty("sn_wn.whats_new.ui.default_help_tab", "true") === "true")
		};

		if (gs.nil(payload) || !this.validateReferringURLPayload(payload)) {
			res.menuPage.status = this.restResponseInvalid.status;
			res.menuPage.message = this.restResponseInvalid.message;
			return res;
		}

		this._initMenuPage(res.menuPage, payload);

		var appConfig = this._getAppConfig(res.menuPage.referringURL);
		if (!appConfig.sysId)
			return res;
		var userAppActivityGR = this.whatsNewUtil.getRecordByParams(WhatsNewCommonConstants.TABLE.SN_WN_USER_APP_ACTIVITY, {
			app_config: appConfig.sysId,
			user: gs.getUserID()
		}, null, null, true);
		if(!userAppActivityGR.hasNext())
			res.newContentAvailable = true;
		res.menuPage.appConfigSysId = appConfig.sysId;
		res.menuPage.title = appConfig.title;
		res.menuPage.shortDescription = appConfig.shortDescription;

		var appConfigContentGR = this._getConfigContentRecords(appConfig.sysId, null, res.menuPage.limit);
		res.menuPage.total = appConfigContentGR.getRowCount();
		res.menuPage.content = this._buildContent(appConfigContentGR, true);
		if(res.menuPage.content.length > 0 && (gs.getProperty("sn_wn.whats_new.ui.enabled", "false") === "true"))
			res.showWnTab = true;
		return res;
	},

	handleFeaturePageRequest: function(payload) {
		var featurePage = {
			appConfigSysId: "",
			content: [],
			limit: 10,
			message: "",
			offset: 0,
			referringURL: "",
			shortDescription: "",
			status: 200,
			title: "",
			total: 0
		};

		if (gs.nil(payload) || !this.validateReferringURLPayload(payload)) {
			featurePage.status = this.restResponseInvalid.status;
			featurePage.message = this.restResponseInvalid.message;
			return featurePage;
		}

		this._initFeaturePage(featurePage, payload);

		var appConfig = this._getAppConfig(featurePage.referringURL);
		if (!appConfig.sysId)
			return featurePage;

		featurePage.appConfigSysId = appConfig.sysId;
		featurePage.title = appConfig.title;
		featurePage.shortDescription = appConfig.shortDescription;

		var appConfigContentGR = this._getConfigContentRecords(appConfig.sysId, featurePage.offset, featurePage.limit);
		featurePage.content = this._buildContent(appConfigContentGR);
		featurePage.total = featurePage.content.length;

		return featurePage;
	},

	handleUserAppActivityRequest: function(payload) {
		payload.userSysId = payload.userSysId || gs.getUserID();
		if (gs.nil(payload) || !this.validateUserAppActivityPayload(payload))
			return this.restResponseInvalid;

		var sysId = this.whatsNewUtil.checkAndInsert(WhatsNewCommonConstants.TABLE.SN_WN_USER_APP_ACTIVITY, {
			user: payload.userSysId,
			app_config: payload.appConfigSysId
		}, true);

		return gs.nil(sysId) ? this.restResponseConflict : this.restResponseOk;
	},

	handleUserActivityRequest: function(payload) {
		if(!payload.appConfigSysId)
			return this.restResponseInvalid;
		var res = this.handleUserAppActivityRequest(payload);
		if(res.status !== 200) 
			return this.restResponseOk;
		var appConfigContentGR = this._getConfigContentRecords(payload.appConfigSysId);
		var sysId;
		while(appConfigContentGR.next()) {
			if(!this._hasReadContent(appConfigContentGR.getValue('content'))) {
				sysId = this.whatsNewUtil.checkAndInsert(WhatsNewCommonConstants.TABLE.SN_WN_USER_CONTENT_ACTIVITY, {
					user: payload.userSysId,
					content: appConfigContentGR.getValue('content')
				}, true);
				if(gs.nil(sysId))
					allUserContentRecordsInserted = false;
			}
		}
		return this.restResponseOk;
	},

	validateHasUserAppActivityPayload: function(payload, userAppActivity) {
		if (gs.nil(payload) || gs.nil(payload.userSysId) || gs.nil(payload.referringURL)) {
			userAppActivity.status = this.restResponseInvalid.status;
			userAppActivity.message = this.restResponseInvalid.message;
			return false;
		}

		if (!this.doesRecordExist("sys_user", payload.userSysId)) {
			userAppActivity.status = this.restResponseNotFound.status;
			userAppActivity.message = gs.getMessage("Record not found in {0} for sys_id {1}", ["sys_user", payload.userSysId]);
			return false;
		}

		return true;
	},

	validateReferringURLPayload: function(payload) {
		return !gs.nil(payload.referringURL);
	},

	validateUserAppActivityPayload: function(payload) {
		if (gs.nil(payload.userSysId) || gs.nil(payload.appConfigSysId))
			return false;
		return this.doesRecordExist('sys_user', payload.userSysId) && this.doesRecordExist(WhatsNewCommonConstants.TABLE.SN_WN_APP_CONFIG, payload.appConfigSysId);
	},

	validateUserContentActivityPayload: function(payload) {
		if (gs.nil(payload.userSysId) || gs.nil(payload.contentSysId))
			return false;
		return this.doesRecordExist('sys_user', payload.userSysId) && this.doesRecordExist(WhatsNewCommonConstants.TABLE.SN_WN_CONTENT, payload.contentSysId);
	},

	doesRecordExist: function(table, recordSysId) {
		var gr = this.whatsNewUtil.getRecordBySysId(table, recordSysId, true);
		return !gs.nil(gr) && gr.isValidRecord();
	},

	_initFeaturePage: function(featurePage, payload) {
		if (!gs.nil(payload.referringURL))
			featurePage.referringURL = decodeURIComponent(payload.referringURL + "");
		if (!gs.nil(payload.offset) && !isNaN(parseInt(payload.offset)))
			featurePage.offset = parseInt(payload.offset);
		if (!gs.nil(payload.limit) && !isNaN(parseInt(payload.limit)))
			featurePage.limit = parseInt(payload.limit);
	},

	_initMenuPage: function(menuPage, payload) {
		if (!gs.nil(payload.referringURL))
			menuPage.referringURL = decodeURIComponent(payload.referringURL + "");
		if (!gs.nil(payload.limit) && !isNaN(parseInt(payload.limit)))
			menuPage.limit = parseInt(payload.limit);
	},

	_initUserAppActivity: function(userAppActivity, referringURL, userSysId) {
		userAppActivity.referringURL = decodeURIComponent(referringURL + "");
		userAppActivity.userSysId = userSysId;
	},

	_processContext: function (context) {
		if (!context) return '';
		context = context[0] == '/' ? context.substr(1) : context; // Remove preceeding '/'
		context = context[context.length - 1] == '/' ? context :  context + '/'; // Add '/' at the end
		return context;
	},

	_doContextsMatch: function(contextFromAPI, contextInDB) {
		contextFromAPI = contextFromAPI && contextFromAPI.trim();
		contextInDB = contextInDB && contextInDB.trim();

		if (!contextFromAPI || !contextInDB) return false;

		contextFromAPI = this._processContext(contextFromAPI);
		contextInDB = this._processContext(contextInDB);

		return contextFromAPI.indexOf(contextInDB) != -1;
	},

	_getAppConfig: function(referringURL) {
		var appConfig = {
			sysId: "",
			path: "",
			title: "",
			shortDescription: ""
		};

		var appConfigGR = new GlideRecord(WhatsNewCommonConstants.TABLE.SN_WN_APP_CONFIG);
		appConfigGR.addActiveQuery();
		appConfigGR.query();
		while (appConfigGR.next()) {
			var path = appConfigGR.getValue("base_path");
			// Initially the first matching application configuration is sufficient.
			// Later, may require a reason to differentiate between multiple app config records that match
			if (this._doContextsMatch(referringURL, path)) {
				appConfig.sysId = appConfigGR.getUniqueValue();
				appConfig.path = path;
				appConfig.title = appConfigGR.getDisplayValue("title");
				appConfig.shortDescription = appConfigGR.getDisplayValue("short_description");
				return appConfig;
			}
		}

		return appConfig;
	},

	_getConfigContentRecords: function(appConfigSysId, offset, limit) {
		var appConfigContentGR = new GlideRecordSecure(WhatsNewCommonConstants.TABLE.SN_WN_APP_CONFIG_CONTENT_M2M);
		appConfigContentGR.addQuery("app_config", appConfigSysId);
		appConfigContentGR.addNotNullQuery("content");
		appConfigContentGR.addQuery("content.active", true);
		appConfigContentGR.addQuery("content.state", "published");
		if ((gs.getProperty("sn_wn.whats_new.ui.show_future_content", true)) !== "true") {
			var version = gs.getProperty("glide.buildname");
			var versionChar = version ? version.toLowerCase().charAt(0) : WhatsNewCommonConstants.DEFAULT_VERSION_CHAR;
			var mappedVersion = WhatsNewCommonConstants.VERSION_MAPPING[versionChar] || versionChar;
			appConfigContentGR.addQuery("content.min_version", "<=", mappedVersion);
		}
		appConfigContentGR.orderBy("order");
		if ((offset === 0 || offset) && limit)
			appConfigContentGR.chooseWindow(offset, offset + limit);
		else if (!offset && limit)
			appConfigContentGR.setLimit(limit);
		appConfigContentGR.query();

		return appConfigContentGR;
	},

	_buildContent: function(appConfigContentGR, reducedContent) {
		var content = [];

		while (appConfigContentGR.next()) {
			var contentGR = this.whatsNewUtil.getRecordBySysId(WhatsNewCommonConstants.TABLE.SN_WN_CONTENT, appConfigContentGR.getValue("content"));
			if (!contentGR || !contentGR.isValidRecord())
				continue;
			if (reducedContent)
				content.push({
					"title": contentGR.getDisplayValue("title"),
					"content": (contentGR.getDisplayValue("short_description") || contentGR.getDisplayValue("content")),
					"minimizedText": true,
					"read": this._hasReadContent(contentGR.getUniqueValue()),
					"sys_id": contentGR.getUniqueValue()
				});
			else
				content.push({
					"title": contentGR.getDisplayValue("title"),
					"short_description": contentGR.getDisplayValue("short_description"),
					"content": contentGR.getDisplayValue("content"),
					"minimizedText": true,
					"mediaArr": this._getContentMedia(contentGR.getUniqueValue()),
					"available": this._isContentAvailable(contentGR),
					"read": this._hasReadContent(contentGR.getUniqueValue()),
					"doc_resource": contentGR.getDisplayValue("doc_resource"),
					"sys_id": contentGR.getUniqueValue()
				});
		}

		return content;
	},
    _compareVersions: function(v1, v2) {
		/*
		returns 1 if the first version is greater, 
		-1 if the second version is greater, 
		0 if they are equal,
		undefined if couldn't be determined
		*/
		v1 = v1 && v1.trim();
		v2 = v2 && v2.trim();

		if (!v1 && !v2 || v1 == v2) {
			return 0;
		} else if (!v1) {
			return -1;
		} else if (!v2) {
			return 1;
		}

		var v1VersionSplit = v1.split('.');
		var v2VersionSplit = v2.split('.');

		while (v1VersionSplit.length < v2VersionSplit.length) {
			v1VersionSplit.push('0');
		}
		while (v1VersionSplit.length > v2VersionSplit.length) {
			v2VersionSplit.push('0');
		}

		function getNumPrefix(str) {
			/*
			returns the number prefix of the input string
			Ex: 
			i/p: 23abc
			o/p: 23
			*/
			if (!isNaN(str)) return str;
			var result = '';
			for (var i = 0; i < str.length; i++) {
				if (isNaN(str[i]))
					return result;
				result += str[i];
			}
			return result;
		}

		for (var i = 0; i < v1VersionSplit.length; i++) {
			var v1Val = v1VersionSplit[i].trim() || '0';
			var v2Val = v2VersionSplit[i].trim() || '0';

			// If either of the values is not an actual number Ex: 0-SNAPSHOT
			if (isNaN(v1Val) || isNaN(v2Val)) {
				var v1NumPrefix = getNumPrefix(v1Val);
				var v2NumPrefix = getNumPrefix(v2Val);

				// return undefined if both the values don't have any number prefix
				if (!v1NumPrefix && !v2NumPrefix)
					return;

				if (v1NumPrefix == v2NumPrefix)
					continue;

				// If one of the values has a number prefix and the other doesn't
				if (!v1NumPrefix || !v2NumPrefix) {
					if (v1NumPrefix == '0')
						return -1;
					if (v2NumPrefix == '0')
						return 1;
					return;
				}
				v1Val = v1NumPrefix;
				v2Val = v2NumPrefix;
			}

			// both are numbers
			if (!isNaN(v1Val) && !isNaN(v2Val)) {
				v1Val = Number(v1Val);
				v2Val = Number(v2Val);

				if (v1Val > v2Val) {
					return 1;
				} else if (v1Val < v2Val) {
					return -1;
				}
			}
		}
		return 0;
    },

	_isContentAvailable: function(contentGR) {
		var currentVersion = gs.getProperty("glide.buildname");
		var versionChar = currentVersion ? currentVersion.toLowerCase().charAt(0) : WhatsNewCommonConstants.DEFAULT_VERSION_CHAR;
		var mappedCurrentVersion = WhatsNewCommonConstants.VERSION_MAPPING[versionChar] || versionChar;
		if (contentGR.getValue("min_version") > mappedCurrentVersion)
			return false;

		var requiredPlugins = contentGR.getValue("required_plugin");
		if (gs.nil(requiredPlugins))
			return true;

		requiredPlugins = JSON.parse(requiredPlugins);
		var installedPlugins = this._getInstalledPluginVersions(Object.keys(requiredPlugins));

		for (requiredPluginId in requiredPlugins) {
			if (!installedPlugins.hasOwnProperty(requiredPluginId))
				return false;
			if (!(this._compareVersions(installedPlugins[requiredPluginId], requiredPlugins[requiredPluginId]) >= 0))
				return false;
		}

		return true;
	},

	_getInstalledPluginVersions: function(pluginIds) {
		var installedPlugins = {};
		var pluginGR = new GlideRecord("v_plugin");
		pluginGR.addEncodedQuery("idIN" + pluginIds.toString() + "^activeINactive,upgradable");
		pluginGR.query();
		while (pluginGR.next())
			installedPlugins[pluginGR.getValue("id")] = pluginGR.getValue("version");

		return installedPlugins;
	},

	_hasReadContent: function(contentSysId) {
		var userContentGR = new GlideRecord(WhatsNewCommonConstants.TABLE.SN_WN_USER_CONTENT_ACTIVITY);
		userContentGR.addQuery("content", contentSysId);
		userContentGR.addQuery("user", gs.getUserID());
		userContentGR.setLimit(1);
		userContentGR.query();

		return userContentGR.hasNext();
	},

	_getContentMedia: function(contentSysId) {
		var mediaArr = [];

		var contentMediaGR = new GlideRecord(WhatsNewCommonConstants.TABLE.SN_WN_CONTENT_MEDIA_M2M);
		contentMediaGR.addQuery("content", contentSysId);
		contentMediaGR.addNotNullQuery("media");
		contentMediaGR.orderBy("order");
		contentMediaGR.query();
		while (contentMediaGR.next()) {
			var mediaGR = this.whatsNewUtil.getRecordBySysId(WhatsNewCommonConstants.TABLE.SN_WN_MEDIA, contentMediaGR.getValue("media"), true);
			mediaArr.push({
				"url": mediaGR.getDisplayValue(mediaGR.getValue("type")),
				"type": mediaGR.getValue("type")
			});
		}

		return mediaArr;
	},

	type: 'WhatsNewAPIHandlerSNC'
};
