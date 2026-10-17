function transform(input) {

    var result = {};

    // Brandings
    result.brandingCountText = (function() {
        var brProfileGR = new GlideAggregate("sys_cs_branding_setup");
        brProfileGR.addAggregate('COUNT');
        brProfileGR.query();
        var _count = brProfileGR.next() ? brProfileGR.getAggregate('COUNT') : 0;
        return gs.getMessage("Branding profiles ({0})", _count);
    })();

    // Channels
    result.channnelsCountText = (function() {
        var chProfileGR = new GlideAggregate("sys_cs_provider");
        chProfileGR.addAggregate('COUNT');
        chProfileGR.query();
        var _count = chProfileGR.next() ? chProfileGR.getAggregate('COUNT') : 0;
        return gs.getMessage("Installed channels ({0})", _count);
    })();

    // Context variables
    result.contextVariablesCountText = (function() {
        var cvProfileGR = new GlideAggregate("sys_cs_virtual_agent_context");
        cvProfileGR.addEncodedQuery('live_agent_setup=f0acbc4c5f091300e6333654de7313c8');
        cvProfileGR.addAggregate('COUNT');
        cvProfileGR.query();
        var _count = cvProfileGR.next() ? cvProfileGR.getAggregate('COUNT') : 0;
        return gs.getMessage("Context variables ({0})", _count);
    })();

    // Pre-chat surveys
    result.preChatSurveysCountText = (function() {
        var pcsProfileGR = new GlideAggregate("sys_cs_survey");
        pcsProfileGR.addEncodedQuery('type=prechat^EQ');
        pcsProfileGR.addAggregate('COUNT');
        pcsProfileGR.query();
        var _count = pcsProfileGR.next() ? pcsProfileGR.getAggregate('COUNT') : 0;
        return gs.getMessage("Pre-chat surveys ({0})", _count);
    })();

    // Topic context intent
    result.topicContextIntentCountText = (function() {
        var tciProfileGR = new GlideAggregate("sys_cs_context_topic");
        tciProfileGR.addAggregate('COUNT');
        tciProfileGR.query();
        var _count = tciProfileGR.next() ? tciProfileGR.getAggregate('COUNT') : 0;
        return gs.getMessage("Topic context intent ({0})", _count);
    })();

    // System messages
    result.systemMessagesCountText = (function() {
        var smProfileGR = new GlideAggregate("sys_properties_category_m2m");
        smProfileGR.addEncodedQuery('category=4f33892a533e5010ad82ddeeff7b1218');
        smProfileGR.addAggregate('COUNT');
        smProfileGR.query();
        var _count = smProfileGR.next() ? smProfileGR.getAggregate('COUNT') : 0;
        return gs.getMessage("System messages ({0})", _count);
    })();

    // URL redirects
    result.urlRedirectsCountText = (function() {
        var urlProfileGR = new GlideAggregate("sys_cs_portal_url_mapping");
        urlProfileGR.addAggregate('COUNT');
        urlProfileGR.query();
        var _count = urlProfileGR.next() ? urlProfileGR.getAggregate('COUNT') : 0;
        return gs.getMessage("URL redirects ({0})", _count);
    })();
	
	// Sensitive Data Handling 
	result.isSenstiveDataPluginInstalled = GlidePluginManager.isActive('com.glide.sensitive_data_handling');
	if (result.isSenstiveDataPluginInstalled) {
		result.sensitiveDatapatternsText = (function() {
			var csRegexGR = new GlideAggregate("sys_sensitive_data_handling_regex");
			csRegexGR.addAggregate('COUNT');
			csRegexGR.query();
			var _count = csRegexGR.next() ? csRegexGR.getAggregate('COUNT') : 0;
			return gs.getMessage("Regular expressions ({0})", _count);
		})();
	} else {
		// TODO: Maintain a central store for all plugin related links used in admin console
		result.sensitiveDataAppLink = "/nav_to.do?uri=$allappsmgmt.do?sysparm_search=com.glide.sensitive_data_handling";
	}
	
    return result;
}
