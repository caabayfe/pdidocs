(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    /**
     * Retrieves SYS_APP records that are Fluent Apps
     */
    try {
        var monoRepoInfo = {
            rootURI: '',
            isMonoRepo: false,
            name: ''
        };
        var scopeID = '';
        if (request.queryParams.sysScope) {
            scopeID = Array.isArray(request.queryParams.sysScope) ? request.queryParams.sysScope[0] : request.queryParams.sysScope;
        }

        var gr = new GlideRecord('sn_glider_ide_file_index');
        gr.addQuery('uri', 'STARTSWITH', 'now-file:');
        gr.addQuery('uri', 'CONTAINS', 'now.config.json');
        // Mono repo URI Path will not contain a scopeID as with conventional app in ServiceNow IDE
        gr.addQuery('uri', 'DOES NOT CONTAIN', scopeID);
        gr.addNullQuery('dtime');
        gr.addNotNullQuery('content');
        gr.addNotNullQuery('checksum');
        gr.query();
        while (gr.next()) {
            var contentRecord = gr.content.getRefRecord();
            var content = gs.base64Decode(contentRecord.getValue('content') || '');
            var nowConfig = JSON.parse(content);
            if (nowConfig.scopeId && nowConfig.scopeId === scopeID) {
                // Get the root path by removing the now.config.json part
                var uriParts = gr.uri.getValue().split('/');
                monoRepoInfo.rootURI = uriParts[0] + '/' + uriParts[1];
                monoRepoInfo.isMonoRepo = true;
                monoRepoInfo.name = uriParts[1];
                break;
            }

        }
        response.setBody(monoRepoInfo);
        return response.setStatus(200);
    } catch (e) {
        var errorMessage = '[IDE] Failed to retrieve Monorepo Uri';
        gs.error(errorMessage, e);
        response.setStatus(500);
        return response.setError(e);
    }

})(request, response);
