(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var filter = request.queryParams.filter?.toString() ?? 'myapp';
        var sortBy = request.queryParams.sort_by?.toString() ?? 'sys_updated_on';
        var sortOrder = request.queryParams.sort_order?.toString() ?? 'desc';
        var allowedSortFields = ['sys_updated_on', 'name', 'scope'];
        if (allowedSortFields.indexOf(sortBy) === -1) {
            sortBy = 'sys_updated_on';
        }

        var service = new DirtyAppsService();
        var apps = service.getDirtyApps(filter, sortBy, sortOrder);

        response.setBody({ apps: apps });
        response.setStatus(200);
    } catch (e) {
        var errorMessage = '[IDE] Failed to retrieve dirty applications';
        gs.error(errorMessage + ': ' + e);
        response.setStatus(500);
        response.setError(e);
    }
})(request, response);
