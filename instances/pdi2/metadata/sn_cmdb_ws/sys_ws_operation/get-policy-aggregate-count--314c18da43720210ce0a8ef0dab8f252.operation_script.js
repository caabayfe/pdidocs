(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var data = {};
    var input = request.body.data;

    if (!input.table)
        return new sn_ws_err.BadRequestError('Missing table id');

    if (!input.policyTypeId)
        return new sn_ws_err.BadRequestError('Missing policy type id');

    if (gs.getProperty('sn_cmdb_ws.glide.cmdb.data.manager.ignore.record.counts', "false") != "false") {
        data.recordCount = "";
    } else {
        ga = new GlideAggregate(input.table);
        ga.addEncodedQuery(input.list_filter, true);
        ga.addAggregate('COUNT');
        ga.query();
        if (ga.next()) {
            data.recordCount = ga.getAggregate('COUNT');
        }

    }

    ga = new GlideAggregate('cmdb_policy_ci_exclusion_list');
    ga.addAggregate('COUNT');
    ga.addQuery('policy_type', input.policyTypeId);
    ga.addEncodedQuery(input.excl_list_filter, true);
    ga.query();
    if (ga.next()) {
        data.excludedCount = ga.getAggregate('COUNT');
    }

    response.setBody(data);
    response.setStatus(200);
	
})(request, response);
