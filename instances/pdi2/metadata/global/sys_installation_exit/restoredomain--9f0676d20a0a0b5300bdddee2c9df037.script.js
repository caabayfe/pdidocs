var RestoreDomain = Class.create();

RestoreDomain.prototype = {
    initialize : function() {
    },

    process : function() {
        var path = transaction.getPageName();
        if (path == 'slushbucket' || path == 'sys_m2m_template')
            return false;

		var isRelatedList = request.getParameter('sys_is_related_list');
		if (isRelatedList && isRelatedList == 'true')
			return false;

		var deferredRelatedList = request.getParameter('partial_page');
		if (deferredRelatedList && deferredRelatedList == 'related_lists')
			return false;
	
		var action = request.getParameter('sys_action');
		if (action == 'sysverb_m2ms')
			return false;
		
        var view = request.getParameter('sysparm_view');
        if (view && view == 'sys_ref_list')
            return false;

        var domainRestore = request.getParameter('sysparm_domain_restore');
        if (domainRestore && domainRestore == 'false') {
            gs.log("Domain left alone because of sysparm_domain_restore:" + domainRestore);
            return false;
        }

        return true;
    }
}
        
