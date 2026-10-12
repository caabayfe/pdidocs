(function executeRule(current, previous /*null when async*/ ) {
    var resourceType = '',
        resourceName = '';

    if (current.use_resource_path) {
        resourceType = 'resource path';
        resourceName = current.resource_path;
    } else {
        resourceType = 'REST API';
        resourceName = current.rest_api;
    }

    // Do not display warning after DB action has been aborted since there is already an error message
    if (current.isActionAborted())
        return;
    
    if (gs.nil(resourceName) || gs.nil(current.domain))
        return;

    // Check to see if a CORS rule already exists with the same domain and path
    var ga = new GlideAggregate('sys_cors_rule');
    ga.addQuery('domain', current.domain);
    ga.addQuery(resourceType.toLowerCase().replace(' ', '_'), resourceName);
    ga.addQuery('sys_id', '!=', current.getUniqueValue());
    ga.addAggregate('COUNT');
    ga.query();

    if (ga.next() && ga.getAggregate('COUNT') > 0) {
        gs.addErrorMessage(
            gs.getMessage(
                "Another CORS rule already exists for {0} '{1}' from domain {2}. When duplicate rules are present, we cannot guarantee which one will be applied. Please, review all duplicate rules and devise an appropriate way to combine them.",
                [resourceType, GlideStringUtil.escapeHTML(resourceName), GlideStringUtil.escapeHTML(current.domain)]));
    }
})(current, previous);
