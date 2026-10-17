var UrlUnfurlingCacheUtils = Class.create();
UrlUnfurlingCacheUtils.prototype = {
	initialize: function() {
	},

	/**
	 * Query the cache to get unfurl data for the given url
	 */
	getDataFromCache: function(url, deviceType) {
		deviceType = deviceType || 'mweb';

		var result = {};
		result.url_unfurl_data = "";
		result.is_unfurl_data_present = false;
		var logUtil = new LinkUnfurlingLoggingUtils();

		if (!gs.nil(url)) {
			var gr = new GlideRecord("sys_cs_url_unfurl_cache");
			if (gr.isValid()) {
				gr.addQuery("url", url);
				gr.addQuery("device_type", deviceType);
				gr.query();
				if (gr.next()) {
					result.is_unfurl_data_present = true;
					result.url_unfurl_data = gr.getValue("unfurl_data");
					logUtil.atDebug(url).log('Link Unfurling cache hit for url={0}', url);
					return result;
				}
			}
		}

		logUtil.atDebug(url).log('Link Unfurling cache miss for url={0}', url);
		return result;
	},

	/**
	 * Unfurl a HTML page and save the unfurl data to the cache
	 */
	getUnfurlDataFromHTMLAndSaveToCache: function(url, html, deviceType, conversationId) {
		deviceType = deviceType || 'mweb';

		var urlUnfurlData = "";
		var logUtil = new LinkUnfurlingLoggingUtils();

		try {
			var jsonObj = {};
			var tagMap = sn_cs.ChatLinkUnfurlObject.unfurlLink(html, url, conversationId);

			if (!gs.nil(tagMap)) {
				jsonObj["title"] = tagMap["title"];
				jsonObj["site_name"] = tagMap["site_name"];
				jsonObj["url"] = tagMap["url"];
				jsonObj["short_description"] = tagMap["short_description"];
				jsonObj["image_link"] = tagMap["image_link"];
				jsonObj["video_link"] = tagMap["video_link"];
				jsonObj["type"] = tagMap["type"];
				jsonObj["fav_icon"] = tagMap["fav_icon"];
			}

			urlUnfurlData = JSON.stringify(jsonObj);

			// Update the cache with this data
			this.saveToCacheIfEnabled(url, urlUnfurlData, deviceType);
		} catch (ex) {
			logUtil.atError(url).log("Error trying to unfurl and cache the url={0}, with data={1}: {2}",
								url, urlUnfurlData, ex.toString());
		}

		return urlUnfurlData;
	},

	saveToCacheIfEnabled: function(url, urlUnfurlData, deviceType) {
		var logUtil = new LinkUnfurlingLoggingUtils();

		var cacheEnabled = gs.getProperty("com.glide.cs.enable_link_unfurling_cache", "true");
		logUtil.atDebug(url).log("Link Unfurling cache is enabled: {0}", cacheEnabled);
		if (cacheEnabled == "true") {
			var unfurlCacheGr = new GlideRecord("sys_cs_url_unfurl_cache");
			if (unfurlCacheGr.isValid()) {
				unfurlCacheGr.addQuery("url", url);
				unfurlCacheGr.addQuery("device_type", deviceType);
				unfurlCacheGr.setLimit(1);
				unfurlCacheGr.query();

				if(unfurlCacheGr.next()) {
					unfurlCacheGr.setValue("unfurl_data", urlUnfurlData);
					if(unfurlCacheGr.update()) {
						logUtil.atInfo(url).log("Successfully updated cache for url={0}, device type={1} with data={2}", url, deviceType, urlUnfurlData);
					}
				} else {
					unfurlCacheGr.initialize();
					unfurlCacheGr.setValue("url", url);
					unfurlCacheGr.setValue("unfurl_data", urlUnfurlData);
					unfurlCacheGr.setValue("device_type", deviceType);
					unfurlCacheGr.insert();
					logUtil.atInfo(url).log("Successfully cached url={0} for device type={1} with data={2}", url, deviceType, urlUnfurlData);
				}
			}
		}
	},

	/**
	 * Create and send the unfurling card
	 */
	createAndSendUnfurlingCard: function(jsonData, url, deviceType, messageId, conversationId) {
		var result = {};
		var logUtil = new LinkUnfurlingLoggingUtils();

		try {
			if (gs.nil(jsonData)) {
				logUtil.atError(url, conversationId).log("Error creating unfurling card: input JSON data is nil");
				result.error_message = gs.getMessage("Create and send unfurling card: input Json data is nil.");
				result.success = false;
				return result;
			}

			var tagMap = JSON.parse(jsonData);
			if (Object.keys(tagMap).length === 0) {
				logUtil.atError(url, conversationId).log("Error creating unfurling card: input JSON data is empty");
				result.error_message = gs.getMessage("Create and send unfurling card: input Json data is empty.");
				result.success = false;
				return result;
			}

			if (gs.nil(tagMap["short_description"]) || gs.nil(tagMap["title"])) {
				logUtil.atError(url, conversationId).log("Error creating unfurling card: Missing short description or title tags");
				result.error_message = gs.getMessage("Create and send unfurling card: Cannot create card as short description or title tags are empty.");
				result.success = false;
				return result;
			}

			if (gs.nil(tagMap["site_name"]))
				tagMap["site_name"] = url;
			if (gs.nil(tagMap["url"]))
				tagMap["url"] = url;

			if (!tagMap["image_link"].toLowerCase().startsWith("http"))
				tagMap["image_link"] = "";

			var unfurlUrlUtils = new UrlUnfurlingUtils();
			var templateType = unfurlUrlUtils.getTemplateType(tagMap);
			// Use default favicon location if no favicon found or if the favicon that is found is a relative path
			tagMap["fav_icon"] = unfurlUrlUtils.updateFavicon(tagMap);

			sn_cs.ChatLinkUnfurlObject.sendUnfurledMessageQ(templateType, tagMap, deviceType, messageId, conversationId);
			result.success = true;
		} catch (ex) {
			result.success = false;
			result.error_message = gs.getMessage("Create and send unfurling card: Error has occurred during link unfurling: {0} ", ex);
			logUtil.atError(url, conversationId).log("Error creating unfurling card: {0}", ex);
			return result;
		}

		return result;
	},

	type: 'UrlUnfurlingCacheUtils'
};
