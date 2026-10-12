var ATFUtil = Class.create();
ATFUtil.prototype = {
    type: 'ATFUtil'
};

ATFUtil.getDocumentClonerOptions = function() {
	var result = {};

	// Helper that will only add properties to the JSON result if they are explicitly defined
	// It's important to differentiate between null (not defined) and empty string here (which are both falsy)
	function addPropertyIfDefined(jsonName, propertyName) {
		var value = GlideProperties.get(propertyName);
		if (value !== null) {
			// Convert to string, then split it into a list using commas
			result[jsonName] = String(value).split(",");
		}
	}

	addPropertyIfDefined("ignoredTags", "sn_atf.document_cloner.ignored_tags");
	addPropertyIfDefined("ignoredStyleAttributePrfx", "sn_atf.document_cloner.ignored_style_prefixes");
	addPropertyIfDefined("alwaysCopyStyles", "sn_atf.document_cloner.always_copy_styles");
	addPropertyIfDefined("ignoredStyleCopy", "sn_atf.document_cloner.ignored_style_copy");
	addPropertyIfDefined("deepCloneTags", "sn_atf.document_cloner.deep_clone_tags");
	addPropertyIfDefined("skipChildrenTags", "sn_atf.document_cloner.skip_children_tags");

	// This one is just a normal boolean, no need to worry about null/non-null
	result["copyAllComputedStyles"] = GlideProperties.getBoolean("sn_atf.screenshots.copy_all_computed_styles", false);
	result["maxElementSize"] = GlideProperties.getInt("sn_atf.screenshots.max_element_size", 5000);

	return result;
};

ATFUtil.getAppStoreBaseUrl = function() {
	var baseUrl = gs.getProperty("sn_appclient.repository_base_url", "https://store.servicenow.com/");
	if (!baseUrl.endsWith("/"))
		baseUrl += "/";

	return baseUrl;
};

ATFUtil.getTestGeneratorAndCloudRunnerAppStorePageUrl = function() {
	return ATFUtil.getAppStoreBaseUrl() + "sn_appstore_store.do#!/store/application/db1676d7421441106f046193880e0b37/";
};

/**
 * Returns true if the specified test/suite can be run right now
 * @param current Test/suite to check (GlideRecord)
 */
ATFUtil.canRunTest = function(current) {
	// Can't run if the test doesn't exist
	if (!current)
		return false;

	// Can't run while impersonated (except for certain special cases)
	if (!sn_atf.ImpersonateAPI.canRunTestInSession())
		return false;

	// Can't run if ATF is turned off
	if (!sn_atf.AutomatedTestingFramework.isRunnerEnabled())
		return false;

	// Can't run if the test/suite isn't active
	if (!current.active)
		return false;

	// Can't run reusable tests
	if (current.getValue("sys_class_name") === "sys_atf_test_callable")
		return false;

	// Can't run in mobile
	if (GlideMobileExtensions.getDeviceType() != "doctype")
		return false;

	// Can't run if the test has too many modified records (they must be reset first)
	if (new sn_atf.UserTestProcessor().hasTooManyModifiedRecords(current))
		return false;

	return true;
};
