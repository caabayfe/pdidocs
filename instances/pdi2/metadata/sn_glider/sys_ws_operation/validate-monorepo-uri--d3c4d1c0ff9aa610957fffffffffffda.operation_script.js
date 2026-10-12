(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    /**
     * Retrieves SYS_APP records that are Fluent Apps
     */
    try {
        var uri = '';
        if (request.queryParams.uri) {
            uri = Array.isArray(request.queryParams.uri) ? request.queryParams.uri[0] : request.queryParams.uri;
        }
        var ga = new GlideAggregate('sn_glider_ide_file_index');
        ga.addQuery('uri', 'CONTAINS', uri);
        ga.addQuery('uri', 'CONTAINS', 'now.config.json');
        ga.addNullQuery('dtime');
        ga.addAggregate('COUNT');
        ga.query();

        var doesMonoRepoUriExist = false;
        var appCount = 0;

        if (ga.next()) {
            appCount = parseInt(ga.getAggregate('COUNT'), 10);
            doesMonoRepoUriExist = appCount > 0;
        }

        response.setBody({
            doesMonoRepoUriExist: doesMonoRepoUriExist,
            AppCount: appCount
        });
        return response.setStatus(200);
    } catch (e) {
        var errorMessage = '[IDE] Failed to validate Monorepo Uri';
        gs.error(errorMessage, e);
        response.setStatus(500);
        return response.setError(e);
    }

})(request, response);
