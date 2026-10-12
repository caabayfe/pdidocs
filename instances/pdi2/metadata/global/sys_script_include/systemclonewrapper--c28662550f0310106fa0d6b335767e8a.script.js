var SystemCloneWrapper = Class.create();
SystemCloneWrapper.prototype = (function() {
    var XML_STATS_EKMS_SUPPORT = "ekms_automation_support";

    return {
        initialize: function() {},

        getEKMSSupportKey: function() {
            return XML_STATS_EKMS_SUPPORT;
        },

        type: 'SystemCloneWrapper'
    };
})();

SystemCloneWrapper.getCloneServerURL = function() {
	var serverUrl = gs.getProperty('glide.db.clone.instance_clone_server');
	if(!gs.nil(serverUrl))
		return serverUrl.substring(0, serverUrl.lastIndexOf('/') + 1);
	
	return '';
};

SystemCloneWrapper.isCloneAllowed = function() {
	var instanceName = SncCloneUtils.getSourceInstanceName();
	var isLocalHost = gs.getProperty("glide.servlet.uri").indexOf('localhost') > -1;
	var isDeveloper = GlideUtil.isDeveloperInstance();
	var isProduction = GlideUtil.isProductionInstance();
	var subprodRegEx = /.+(dev|test(ing)?|sandbox|qa|stage|staging|uat|pov)([0-9])*$/i;
	var isSubprod = subprodRegEx.test(instanceName) || !isProduction;

	// allow dev and sub-prods to be cloned over;
	// production, demo, training should not be allowed to be cloned over by default

	if (isDeveloper || isLocalHost || isSubprod)
		return true;
	else
		return false;
};

SystemCloneWrapper.getServerPassword = function () {
	return gs.getProperty('glide.customurl.datacenter.instance.password', null);
};

SystemCloneWrapper.checkEKMSXMLStats = function() {
    var stats = new GlideXMLStats();
    var xml = stats.toString();
    var xmlDoc = new XMLDocument2();
    var sys_clone = new global.SystemCloneWrapper();
    xmlDoc.parseXML(xml);
    var node = xmlDoc.getFirstNode("//capability");
    while (node) {
        if (node.getTextContent() == sys_clone.getEKMSSupportKey()) {
            return true;
        }
        node = xmlDoc.getNextNode(node);
    }
    return false;
};
