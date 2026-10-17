var MobileDeepLinkGenerator = Class.create();

// Mobile deep link format: {scheme}://{authority}/mobileapplink?snapp={appName}&params={params}
var scheme;
var authority;
var appName;
var params;

MobileDeepLinkGenerator.prototype = {
    initialize: function(mobileAppName) {
		var mobileAppGR = new GlideRecord('sys_sg_mobile_application');
		mobileAppGR.addQuery('name', mobileAppName);
		mobileAppGR.query();
		if (!mobileAppGR.next())
			throw new Error("Mobile Application: " + mobileAppName + " does not match any valid mobile applications.");

		var instanceId = gs.getProperty('instance_id');
		var instanceName = gs.getProperty('glide.sg.deeplink.instance_name', gs.getProperty('instance_name'));
		var domain = gs.getProperty('glide.sg.deeplink.instance_domain', 'service-now.com');

		// Initialize deep link properties
		this.scheme = "https";
		this.authority = instanceName + "." + domain;
		this.appName = mobileAppGR.link_path;
		this.params = {
			"instanceId": instanceId,
			"instanceName": instanceName,
			"instanceUrl": this.scheme + "://" + this.authority
		};
    },

	ID_TYPES: {
		SCREEN: "Screen",
		BUTTON: "Button",
		APPLET_LAUNCHER: "AppletLauncher"
	},

	/**
	 * Public methods
	**/
	getScreenLink: function(documentId, /* json dictionary */ uiParams) {
		var payload = this._generatePayload(documentId, this.ID_TYPES.SCREEN, "", "", uiParams);
		this.params.redirectPayload = payload;
		return this._generateLink("redirect");
	},

	getFormScreenLink: function(formScreenId, tableName, recordSysId) {
		var payload = this._generatePayload(formScreenId, this.ID_TYPES.SCREEN, tableName, recordSysId);
		this.params.redirectPayload = payload;
		return this._generateLink("redirect");
	},

	getLauncherScreenLink: function(launcherScreenId) {
		var payload = this._generatePayload(launcherScreenId, this.ID_TYPES.APPLET_LAUNCHER);
		this.params.redirectPayload = payload;
		return this._generateLink("redirect");
	},

	getButtonLink: function(buttonId, tableName, recordSysId) {
		var payload = this._generatePayload(buttonId, this.ID_TYPES.BUTTON, tableName, recordSysId);
		this.params.redirectPayload = payload;
		return this._generateLink("launch_button");
	},

	getUniversalLink: function(url, isExperienceSwitchEnabled) {
		this.params.url = url;
		if (typeof isExperienceSwitchEnabled === 'boolean')
			this.params.isExperienceSwitchEnabled = isExperienceSwitchEnabled;
		return this._generateLink("ulink");
	},

	getPrefillLink: function(forceLocalLogin) {
		this.params.forceLocalLogin = (forceLocalLogin === undefined) ? false : forceLocalLogin;
		return this._generateLink("prefill");
	},

	getSSOPrefillLink: function(forceSsoId) {
		this.params.forceSsoId  = forceSsoId;
		return this._generateLink("ssoPrefill");
	},

	getUrlLink: function(url) {
		this.params.url = url;
		return this._generateLink("open_url")
	},

	/**
	 * Private methods
	**/
	_generateLink: function(action) {
		return this._createMobileLink(action);
	},

	_createMobileLink: function(action) {
		this.params.action = action;
		var base64Parameters = GlideStringUtil.base64Encode(JSON.stringify(this.params));
		return this.scheme + "://" + this.authority + "/mobileapplink" + "?snapp=" + this.appName + "&params=" + base64Parameters;
	},

	_generatePayload: function(id, idType, tableName, recordSysId, uiParams) {
		if (!id)
			throw new Error(idType + "Id is invalid");

		if (recordSysId && !tableName)
			throw new Error("table name is missing for record " + recordSysId);

		var payload = {};
		payload[idType + 'Id'] = id;
		if (recordSysId) {
			payload['RecordId'] = recordSysId;
			payload['TableName'] = tableName;
		}

		if (uiParams)
			payload['FormFieldValues'] = uiParams;

		return GlideStringUtil.base64Encode(JSON.stringify(payload));
	},

    type: 'MobileDeepLinkGenerator'
};
