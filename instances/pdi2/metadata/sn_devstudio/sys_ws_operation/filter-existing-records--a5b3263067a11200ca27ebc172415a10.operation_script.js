(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) || VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId);

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var foundRecords = _.filter(request.body.data.records, function(record) {
        try {
            var gr = new GlideRecord(record.table);
            return gr.get(record.sysId);
        } catch (e) {

        }
    });

    response.setContentType('application/json');
    response.setBody({
        records: foundRecords
    });
    response.setStatus(200);
})(request, response);
