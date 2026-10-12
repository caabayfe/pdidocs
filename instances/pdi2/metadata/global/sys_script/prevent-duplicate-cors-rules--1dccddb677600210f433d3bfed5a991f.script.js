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

    // Check to see if a CORS rule already exists with the same domain and path
    var uniqueGr = new GlideAggregate('sys_cors_rule');
    uniqueGr.addQuery('domain', current.domain);
    uniqueGr.addQuery(resourceType.toLowerCase().replace(' ', '_'), resourceName);
    uniqueGr.addQuery('sys_id', '!=', current.getUniqueValue());
    uniqueGr.addAggregate('COUNT');
    uniqueGr.query();

    if (uniqueGr.next() && uniqueGr.getAggregate('COUNT') > 0) {
        gs.addErrorMessage(
            gs.getMessage(
                "CORS rule already exists for {0} '{1}' from domain {2}.",
                [resourceType, GlideStringUtil.escapeHTML(resourceName), GlideStringUtil.escapeHTML(current.domain)]));
        current.setAbortAction(true);
    }
})(current, previous);
