(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var sort_field = request.queryParams.sort_field ?
            request.queryParams.sort_field[0].toLowerCase() :
            '';
        var sort_order = request.queryParams.sort_order ?
            request.queryParams.sort_order[0].toLowerCase() :
            '';
        var search_term = request.queryParams.search_term ?
            request.queryParams.search_term[0].toLowerCase() :
            '';
        var allow_template_apps = request.queryParams.allow_template_apps ?
            request.queryParams.allow_template_apps[0] :
            'false';
        var limit = request.queryParams.limit ? Number(request.queryParams.limit[0]) : null;
        var offset = request.queryParams.offset ? Number(request.queryParams.offset[0]) : null;
        var userAppSysIds = [];
        var decoratedApplicationList = [];

        var appLastOpenedDatesForUser = new ApplicationService().getUserAppsLastOpened({
            searchTerm: search_term
        });
        var applicationListBuilder = new ApplicationsListBuilder();
        var result = applicationListBuilder.getUserApps({
            sortField: sort_field,
            sortOrder: sort_order,
            allowTemplateApps: allow_template_apps,
            limit: limit,
            offset: offset,
            searchTerm: search_term,
            lastOpenedAppsLookup: appLastOpenedDatesForUser
        });


        userAppSysIds = result.applications;

        userAppSysIds.forEach(function(userAppSysId) {
            decoratedApplicationList.push(
                ApplicationsDataModel.generate(userAppSysId, appLastOpenedDatesForUser)
            );
        });

        response.setBody({
            hasMore: result.hasMore,
            applications: decoratedApplicationList,
        });
        response.setStatus(200);

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang('Unhandled exception {0}', 'en', [exception]))
            .setDetail(gs.getMessage('Unhandled exception {0}', [exception]));
    }
})(request, response);
