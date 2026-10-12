(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const scopeId = request.pathParams.scope_id;

    if (!scopeId) {
        response.setStatus(400);
        return response.setError('Missing required query parameter: scope_id');
    }

    function fetchLatestMetadata(scopeId) {
        var gr = new GlideRecord('sys_update_xml');
        gr.addQuery('application', scopeId);
        gr.addQuery("update_set", "NOT_NULL");
        gr.orderByDesc('sys_updated_on');
        gr.setLimit(1);
        gr.query();

        if (gr.next()) {
            var metadata = {
                sys_id: gr.getValue('sys_id'),
                sys_updated_on: new GlideDateTime(gr.getValue('sys_updated_on')).getNumericValue(),
                sys_updated_by: gr.getValue('sys_updated_by'),
                sys_created_on: new GlideDateTime(gr.getValue('sys_created_on')).getNumericValue(),
                sys_scope: gr.getValue('application'),
                name: gr.getValue('name'),
                target_name: gr.getValue('target_name')
            };

            return metadata;
        }
        return null;
    }

    try {
        var metadata = fetchLatestMetadata(scopeId);

        if (metadata) {
            response.setStatus(200);
            response.setBody(metadata);
            return;
        }

        // Return an empty response if no metadata found
        response.setStatus(200);
        response.setBody({});
    } catch (e) {
        response.setStatus(500);
        response.setError(e.message);
    }

})(request, response);
