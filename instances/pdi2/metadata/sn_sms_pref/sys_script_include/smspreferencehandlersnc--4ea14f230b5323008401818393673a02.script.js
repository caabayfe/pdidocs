var SMSPreferenceHandlerSNC = Class.create();
SMSPreferenceHandlerSNC.prototype = {
	initialize: function (provider) {
		this.provider = provider;
	},

	TABLE_SMS_PREF_CONFIGURATION: 'sn_sms_pref_configuration',
	TABLE_SMS_PREF_REQUEST: 'sn_sms_pref_request',

	// sn_sms_pref_configuration columns
	COLUMN_PROVIDER: 'provider',
	COLUMN_ORDER: 'order',
	COLUMN_DEFAULT_PREFERENCE: 'default_preference',
	COLUMN_OPT_OUT_KEYWORDS: 'opt_out_keywords',
	COLUMN_OPT_IN_KEYWORDS: 'opt_in_keywords',
	COLUMN_OPT_OUT_CONFIRMATION_MESSAGE: 'opt_out_confirmation_message',
	COLUMN_OPT_IN_CONFIRMATION_MESSAGE: 'opt_in_confirmation_message',
	COLUMN_ENABLE_FOR_SHORT_CODE: 'enable_for_short_code',
	COLUMN_ENABLE_FOR_LONG_CODE: 'enable_for_long_code',

	// sn_sms_pref_request columns
	COLUMN_FROM_NUMBER: 'from_number',
	COLUMN_PHONE_NUMBER: 'phone_number',
	COLUMN_KEYWORD: 'keyword',
	COLUMN_OPTED_IN_OUT: 'opted_in_out',

	EXTN_POINT_SMS_PREFERENCES: 'sn_sms_pref.SMSPreferences',

	/*
	 * @returns {GlideRecord|null}
	 */
	getConfig: function() {
		var configGr = new GlideRecord(this.TABLE_SMS_PREF_CONFIGURATION);
		configGr.addQuery(this.COLUMN_PROVIDER, this.provider);
		configGr.orderBy(this.COLUMN_ORDER);
		configGr.query();
		if (configGr.next())
			return configGr;
		return null;
	},

	/*
	 * @returns choiceList
	 */
	getProviderChoiceList: function() {
		var providers = this._getProviders();
		var choiceList = new GlideChoiceList();
		for (var i = 0; i < providers.length; i++) {
			choiceList.add(providers[i].value, providers[i].label);
		}
		return choiceList;
	},

	/*
	 * @param {string} fromNumber
	 * @param {string} phoneNumber
	 * @param {string} body
	 * @param {string} fromNumberType
	 * @returns {object} response
	 * @returns {boolean} response.processed
	 * @returns {string} response.confirmationText
	 */
	processIncomingSMSForOptedRequest: function(fromNumber, phoneNumber, body, fromNumberType) {
		var response = {};
		if (!!body && !!fromNumberType) {
			var configInfo = this._getConfigInfo(body.trim(), fromNumberType);
			if (configInfo) {
				if (configInfo.opt_type) {
					var confText = configInfo.confirmation_message;
					var reqGr = this._upsertRequestRecord(fromNumber, phoneNumber, body.trim(), configInfo.opt_type);
					if (reqGr) {
						confText = this._expandRequestVariables(confText, reqGr);
						response.processed = true;
						response.confirmationText = confText;
					}
				} else {
					// Not opt keyword
					response.processed = false;
				}
			} else {
				// No config
				response.processed = false;
			}
		}
		return response;
	},
	
	/*
	 * @param {string} body
	 * @param {string} fromNumberType
	 * @returns {boolean}
	 */
	
	isOptMessage: function(body, fromNumberType) {
		if (!!body && !!fromNumberType) {
			var configInfo = this._getConfigInfo(body.trim(), fromNumberType);
			if (configInfo) {
				if (configInfo.opt_type) {
					return true;
				}
			}
		}
		return false;
	},

	/*
	 * @param {string} fromNumber
	 * @param {string} fromNumberType
	 * @param {array} phoneNumberArr
	 * @returns {array}
	 */
	getOptedInNumbers: function(fromNumber, fromNumberType, phoneNumberArr) {
		var configGr = this.getConfig();
		if (!configGr) {
			// no config entry
			return phoneNumberArr;
		}
		var configEnabled = false;
		if (fromNumberType === "short")
			configEnabled = configGr.getValue(this.COLUMN_ENABLE_FOR_SHORT_CODE) + '' === '1';
		else if (fromNumberType === "long")
			configEnabled = configGr.getValue(this.COLUMN_ENABLE_FOR_LONG_CODE) + '' === '1';

		if (!configEnabled) {
			// config not enabled
			return phoneNumberArr;
		}
		var optedInNumArr = [];

		if (!Array.isArray(phoneNumberArr))
			return optedInNumArr;

		var isOptedIn;

		for (var i = 0; i < phoneNumberArr.length; i++) {
			isOptedIn = true;
			var requestGr = this._getRequestRecord(fromNumber, phoneNumberArr[i]);
			if (requestGr.next()) {
				if (requestGr.getValue(this.COLUMN_OPTED_IN_OUT)+'' === 'opted_in')
					isOptedIn = true;
				else if (requestGr.getValue(this.COLUMN_OPTED_IN_OUT)+'' === 'opted_out')
					isOptedIn = false;
			} else {
				var defaultPreference = configGr.getValue(this.COLUMN_DEFAULT_PREFERENCE);
				if (defaultPreference === 'opt_in')
					isOptedIn = true;
				else
					isOptedIn = false;
			}
			if (isOptedIn)
				optedInNumArr.push(phoneNumberArr[i]+'');
		}
		return optedInNumArr;
	},

	/*
	 * @returns {array} providers
	 */
	_getProviders: function () {
		var extnPoints = new GlideScriptedExtensionPoint().getExtensions(this.EXTN_POINT_SMS_PREFERENCES);
		var providers = [], extnProviders;
		for (var i = 0; i < extnPoints.length; i++) {
			if (!this._isFunction(extnPoints[i].getProviders))
				continue;

			extnProviders = extnPoints[i].getProviders();
			if (Array.isArray(extnProviders))
				providers = providers.concat(extnProviders);
		}
		return providers;
	},

	/*
	 * @returns {boolean}
	 */
	_isFunction: function(fn) {
		return typeof fn === 'function';
	},

	/*
	 * @param {string} body
	 * @param {string} fromNumberType
	 * @returns {object|null} info
	 * @returns {string} info.opt_type
	 * @returns {string} info.confirmation_message
	 */
	_getConfigInfo: function(body, fromNumberType) {
		var configGr = this.getConfig();
		if (configGr && !!body) {
			if (fromNumberType) {
				var configEnabled = false;
				if (fromNumberType === 'short')
					configEnabled = configGr.getValue(this.COLUMN_ENABLE_FOR_SHORT_CODE) + '' === '1';
				else if (fromNumberType === 'long')
					configEnabled = configGr.getValue(this.COLUMN_ENABLE_FOR_LONG_CODE) + '' === '1';
				if (!configEnabled)
					return null;
			}

			var info = {};
			if (configGr.getValue(this.COLUMN_OPT_OUT_KEYWORDS).toLowerCase().split(',').indexOf(body.toLowerCase()) > -1) {
				info.opt_type = 'out';
				info.confirmation_message = configGr.getValue(this.COLUMN_OPT_OUT_CONFIRMATION_MESSAGE);
			} else if (configGr.getValue(this.COLUMN_OPT_IN_KEYWORDS).toLowerCase().split(',').indexOf(body.toLowerCase()) > -1) {
				info.opt_type = 'in';
				info.confirmation_message = configGr.getValue(this.COLUMN_OPT_IN_CONFIRMATION_MESSAGE);
			}
			return info;
		}
		return null;
	},

	/*
	 * @param {string} fromNumber
	 * @param {string} phoneNumber
	 * @returns {GlideRecord} requestGr
	 */
	_getRequestRecord: function(fromNumber, phoneNumber) {
		var requestGr = new GlideRecord(this.TABLE_SMS_PREF_REQUEST);
		requestGr.addQuery(this.COLUMN_FROM_NUMBER, fromNumber);
		requestGr.addQuery(this.COLUMN_PHONE_NUMBER, phoneNumber);
		requestGr.query();
		return requestGr;
	},

	/*
	 * @param {string} fromNumber
	 * @param {string} phoneNumber
	 * @param {string} body
	 * @param {string} optType
	 */
	_upsertRequestRecord: function (fromNumber, phoneNumber, body, optType) {
		var requestGr = this._getRequestRecord(fromNumber, phoneNumber);
		if (requestGr.next()) {
			requestGr = this._setValuesForRequestRecord(requestGr, null, null, body, optType);
			requestGr.update();
		} else {
			requestGr.initialize();
			requestGr = this._setValuesForRequestRecord(requestGr, fromNumber, phoneNumber, body, optType);
			requestGr.insert();
		}
		return requestGr;
	},

	/*
	 * @param {GlideRecord} requestGr
	 * @param {string} fromNumber
	 * @param {string} phoneNumber
	 * @param {string} keyword
	 * @param {string} optType
	 * @returns {GlideRecord} requestGr
	 */
	_setValuesForRequestRecord: function (requestGr, fromNumber, phoneNumber, keyword, optType) {
		if (requestGr) {
			if (fromNumber)
				requestGr.setValue(this.COLUMN_FROM_NUMBER, fromNumber);
			if (phoneNumber)
				requestGr.setValue(this.COLUMN_PHONE_NUMBER, phoneNumber);
			if (keyword)
				requestGr.setValue(this.COLUMN_KEYWORD, keyword.trim().toUpperCase());
			if (optType) {
				var choiceVal = '';
				if (optType === 'in')
					choiceVal = 'opted_in';
				else if (optType === 'out')
					choiceVal = 'opted_out';
				requestGr.setValue(this.COLUMN_OPTED_IN_OUT, choiceVal);
			}

			return requestGr;
		}
	},

	/**
     * Utility method to expand variables
     * e.g. ${from_number} where from_number is the field on GlideRecord of TABLE_SMS_PREF_REQUEST
     * @param {string} text
	 * @param {GlideRecord} requestGr
     * @returns {string} text
     */
	_expandRequestVariables: function (text, requestGr) {
		// matches variables ${a}
		var pattern = /\$\{[A-Za-z0-9_]+\}/gi;
		// infinite loop protection
        var count = 0;
		while (text.search(pattern) >= 0 && count < 20) {
			count++;
            text = text.replace(pattern, function(match) {
                match = match.replace(/\$\{/g, '');  // remove leading ${
				match = match.replace(/\}$/g, '');   // remove trailing }
				result = requestGr.getValue(match);
                return (result !== null) ? result : '';
            });
        }
        return text;
	},

	type: 'SMSPreferenceHandlerSNC'
};
