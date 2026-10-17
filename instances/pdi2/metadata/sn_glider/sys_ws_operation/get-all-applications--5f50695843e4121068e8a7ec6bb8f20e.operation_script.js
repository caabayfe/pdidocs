(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        // Get the property value
        var propertyValue = gs.getProperty('sn_appauthor.all_company_keys', '');
        var companyKeys = propertyValue ? propertyValue.split(',') : [];

        var gr = new GlideRecord('sys_app');
        gr.addActiveQuery();

        if (companyKeys.length > 0) {
            var queryParts = companyKeys.map(function(key) {
                var prefix = key === 'sn' ? `${key}_` : `x_${key}`;
                return 'scopeSTARTSWITH' + prefix;
            });
            gr.addEncodedQuery(queryParts.join('^OR') + '^ORscope=global');
        }

        gr.query();

        const buildSupport = new sn_glider.IDEBuildSupport();
        var apps = [];
        while (gr.next()) {
            if (!gr.canRead()) continue;
            var recordData = {};
            for (var prop in gr) {
                if (gr.hasOwnProperty(prop)) {
                    recordData[prop] = gr.getValue(prop);
                }
            }
            const sourceFileCount = buildSupport.getAppSourceFileCount(gr.getUniqueValue(), []);
            recordData.sourceFileCount = sourceFileCount;
            apps.push(recordData);
        }

        response.setBody(apps);
        response.setStatus(200);
        return response;
    } catch (e) {
        var errorMessage = '[IDE] Failed to retrieve Fluent applications list';
        gs.error(errorMessage, e);
        response.setStatus(500);
        return response.setError(e);
    }
})(request, response);
