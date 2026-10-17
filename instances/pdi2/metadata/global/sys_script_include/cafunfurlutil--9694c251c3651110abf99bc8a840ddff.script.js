var CAFUnfurlUtil = Class.create();
(function() {
	CAFUnfurlUtil.prototype = {
		initialize: function(providerChannelIdentityId, channelUserId, urlOrText) {
			this.isPrecheckSuccessful = this.preCheck(providerChannelIdentityId, channelUserId, urlOrText);

			if(this.isPrecheckSuccessful) {
				this.providerChannelIdentityId = providerChannelIdentityId;
				this.channelUserId = channelUserId;
				this.customAdapterScriptAPI = new sn_cs.CustomAdapterScriptObject();
				this.allowedHostnameHelper = new global.AllowedHostnameHelper();
			}
		},

		isUnfurlingAllowed: function() {
			return !!this.isPrecheckSuccessful;
		},

		getUnfurlMetadata: function(unfurlMetadataExtractionOptions) {		
			if (!this.isUnfurlingAllowed()) {
				return {};
			}

			unfurlMetadataExtractionOptions = unfurlMetadataExtractionOptions || {};

			var logger = getLogger();
			var logContext = null;
			try {
				logContext = new sn_log.GlideLogContext({ 'conversation': this.lastConversation.conversation_id });

				var unfurlMetadata = callUnfurlMetadataAPI.call(this, {
					url: this.urlToUnfurl,
					provider_channel_identity_id: this.providerChannelIdentityId,
					channel_user_id: this.channelUserId,
					conversation_id: this.lastConversation.conversation_id,
					device_type: this.lastConversation.device_type
				});
				
				if(!unfurlMetadata) {
					return {};
				}

				return unfurlMetadata;

			} finally {
				if(logContext) {
					logContext.clear();
				}
			}
		},

		getHtmlTitle: function(titleExtractionOptions) {
			if (!this.isUnfurlingAllowed()) {
				return '';
			}

			titleExtractionOptions = titleExtractionOptions || {};
			titleExtractionOptions.save_to_cache = (titleExtractionOptions.save_to_cache !== false) ? true : false;

			var logger = getLogger();
			var logContext = null;
			try {
				logContext = new sn_log.GlideLogContext({ 'conversation': this.lastConversation.conversation_id });

				var htmlTitle = callHtmlTitleAPI.call(this, {
					url: this.urlToUnfurl,
					provider_channel_identity_id: this.providerChannelIdentityId,
					channel_user_id: this.channelUserId,
					conversation_id: this.lastConversation.conversation_id,
					device_type: this.lastConversation.device_type
				});

				if(!!htmlTitle && titleExtractionOptions.save_to_cache) {
					updateCacheWithFields.call(this, this.urlToUnfurl, this.lastConversation.device_type, { title : htmlTitle });
				}

				return htmlTitle;

			} catch(e) {
				logger.error("[CAFUnfurlUtil] Error in fetching html title for url {0} => {1}", this.urlToUnfurl, e.message);
			} finally {
				if(logContext) {
					logContext.clear();
				}
			}
		},

		preCheck: function(providerChannelIdentityId, channelUserId, urlOrText) {
			var logger = getLogger();

			if(!providerChannelIdentityId) {
				logger.error("[CAFUnfurlUtil] empty_provider_channel_identity: ignoring unfurling. provider channel identity id should not be empty");
				return false;
			}

			if(!channelUserId) {
				logger.error("[CAFUnfurlUtil] empty_channel_user_id: ignoring unfurling. channel user id should not be empty");
				return false;
			}

			var logContext;
			try {
				logContext = new sn_log.GlideLogContext({ providerUserId : channelUserId });

				if(!urlOrText) {
					logger.warn("[CAFUnfurlUtil] empty_text: ignoring unfurling, url or text passed is empty.");
					return false;
				}
				
				if(!isGlobalUnfurlingEnabled()) {
					logger.info("[CAFUnfurlUtil] global_unfurling_disabled: ignoring unfurling. global unfurling property is not enabled.", providerChannelIdentityId, channelUserId);
					return false;
				}

				if(!isChannelLevelUnfurlingEnabled(providerChannelIdentityId, logger)) {
					logger.info("[CAFUnfurlUtil] channel_unfurling_disabled: ignoring unfurling. unfurling is disabled for the provider channel identity: {0}", providerChannelIdentityId);
					return false;
				}

				var urlsInText = getUrlsFromText(urlOrText);
				if(!Array.isArray(urlsInText) || !urlsInText.length) {
					logger.debug("[CAFUnfurlUtil] no_url_in_text: ignoring unfurling. no urls in the passed in text \"{0}\"", urlOrText);
					return false;
				}

				var urlToUnfurl = getUrlForUnfurlingFromUrls(urlsInText, logger);
				if(!urlToUnfurl) {
					logger.debug("[CAFUnfurlUtil] no_allowed_url_to_unfurl: no url is allowed for unfurling in the passed in text \"{0}\"", urlOrText);
					return false;
				}

				// store url to unfurl in the object. This is used when the actual api's are called.
				this.urlToUnfurl = urlToUnfurl;

				var lastConversationDetails = getLastConversationDetails(providerChannelIdentityId, channelUserId, logger);
				if(!lastConversationDetails.conversation_id) {
					logger.debug("[CAFUnfurlUtil] no_conversation_exists: ignoring unfurling. No conversation exists for the channel user id: {0}", channelUserId);
					return false;
				}

				// store last conversation in the object. This is used when the actual api's are called.
				this.lastConversation = lastConversationDetails;

				return true;
			} finally {
				if(logContext) {
					logContext.clear();
				}
			}
		},


		type: 'CAFUnfurlUtil'
	};

	function isGlobalUnfurlingEnabled(logger) {
		var isGlobalUnfurlingEnabled = gs.getProperty("com.glide.cs.enable_link_unfurling", true);
		return parseBoolean(isGlobalUnfurlingEnabled);	
	}

	function isChannelLevelUnfurlingEnabled(providerChannelIdentityId, logger) {
		var isChannelLevelUnfurlingEnabled = getCustomAdapterProperty("enable_link_unfurling", providerChannelIdentityId, logger);
		return parseBoolean(isChannelLevelUnfurlingEnabled);
	}
	
	function parseBoolean(val) {
		return val == '1' || val =='true' || val == true; 
	}

	function getCustomAdapterProperty(name, providerChannelIdentityId, logger) {
		try {
			var property = sn_cs.VASystemObject.getCustomAdapterPropertyWithHierarchy(name, providerChannelIdentityId);
			if(!property || (property == "null")) {
				return '';
			}
			return property;
		} catch(e) {
			logger.error("[CAFUnfurlUtil] error_in_fetching_caf_property: error in fetching custom adapter property \"{0}\" for provider channel identity: \"{1}\" => {2}", name, providerChannelIdentityId, e.message);
			return '';
		}
	}

	function getLastConversationDetails(providerChannelIdentityId, channelUserId, logger) {
		try {
			var conversationDetailsJson = new sn_cs.CustomAdapterScriptObject().getLastConversationDetails(providerChannelIdentityId, channelUserId);
			var conversationDetails = safeParse(conversationDetailsJson, {});
			return conversationDetails;
		} catch(e) {
			logger.error("[CAFUnfurlUtil] error_in_fetching_last_conversation: Error in fetching last conversation for channel user \"{0}\" and provider channel identity \"{1}\" => {2}", channelUserId, providerChannelIdentityId, e.message);
			return {};
		}
	}

	function getUrlsFromText(urlOrText) {
		var urlListJson = new sn_cs.CustomAdapterScriptObject().getUrlsFromText(urlOrText);
		var urls = safeParse(urlListJson);
		return urls;
	}

	function getUrlForUnfurlingFromUrls(urls, logger) {
		var allowedHostnameHelper = new global.AllowedHostnameHelper();

		var urlToUnfurl = '';
		for(var i = 0; i < urls.length; i++) {
			var url = urls[i];
			url = getTargetUrlFromClickMetricsUrl.call(this, url);

			if(allowedHostnameHelper.isURLAllowedForUnfurling(url)) {
				urlToUnfurl = url;
				break;
			} else {
				logger.debug("[CAFUnfurlUtil] host_not_allowed: hostname is not allowed for unfurling for url => {0}", url);
			}
		}

		return urlToUnfurl;
	}


	function getTargetUrlFromClickMetricsUrl(link) {
		var TARGET_URL_PARAM = "target_url=";
		var VA_LINK = "va_link.do?token=";

		if (link.indexOf(VA_LINK) < 0) {
			// if the url is not click metrics url, then return the original url
			return link;
		}

		var targetUrl = link.substring(link.indexOf(TARGET_URL_PARAM) + TARGET_URL_PARAM.length);
		targetUrl = decodeURIComponent(targetUrl);

		return targetUrl;
	}

	function getLogger() {
		return new sn_log.GlideLogger("com.glide.cs.link_unfurling.CAFUnfurlUtil", {
			app: 'CI',
			track: 'CCCIF Link Unfurling',
			layer: 'Script'
		}, ['app', 'track', 'layer', 'providerUserId', 'conversation']);
	}

	function callUnfurlMetadataAPI(unfurlAPIInputs) {
		if(!unfurlAPIInputs) {
			return {};
		}

		var unfurlAPIInputsJson = JSON.stringify(unfurlAPIInputs);
		var unfurlMetadataJson = new sn_cs.CustomAdapterScriptObject().getUnfurlMetadata(unfurlAPIInputsJson);
		var unfurlMetadata = safeParse(unfurlMetadataJson);
		return unfurlMetadata;
	}

	function callHtmlTitleAPI(unfurlAPIInputs) {
		if(!unfurlAPIInputs) {
			return '';
		}

		var unfurlAPIInputsJson = JSON.stringify(unfurlAPIInputs);
		var htmlTitle = new sn_cs.CustomAdapterScriptObject().getHtmlTitle(unfurlAPIInputsJson);

		return isEmptyString(htmlTitle) ? '' : htmlTitle;
	}

	function updateCacheWithFields(url, deviceType, fieldsToUpdate) {
		var unfurlingCacheUtils = new global.UrlUnfurlingCacheUtils();

		var cachedDataJson = unfurlingCacheUtils.getDataFromCache(this.urlToUnfurl, this.lastConversation.device_type);

		var cachedData = safeParse(cachedDataJson, {});
		var cachedUnfurledData = safeParse(cachedData.url_unfurl_data, {});

		Object.keys(fieldsToUpdate).forEach(function(key, index) {
			if(fieldsToUpdate.hasOwnProperty(key)) {
				cachedUnfurledData[key] = fieldsToUpdate[key];
			}
		});
		
		var cachedUnfurledDataJson = JSON.stringify(cachedUnfurledData);
		
		unfurlingCacheUtils.saveToCacheIfEnabled(this.urlToUnfurl, cachedUnfurledDataJson, this.lastConversation.device_type);
	}

	function isEmptyString(val) {
		return !val || (val == 'null') || (val == 'undefined');
	}

	function safeParse(text, defaultValue) {
		defaultValue = defaultValue || {};

		if(!text) {
			return defaultValue;
		}

		if (isObject(text)) {
			return text;
		}

		if (isString(text)) {
			try {
				return JSON.parse(text);
			} catch (e) {
				return defaultValue;
			}
		} else {
			return defaultValue;
		}
	}

	function isString(str) {
		return (Object.prototype.toString.call(str) === '[object String]');
	}

	function isObject(obj) {
		return ((typeof obj) === 'object');
	}

})();
