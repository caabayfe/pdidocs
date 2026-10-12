(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var table = request.body.data.table || null;
    if (!table)
        return new sn_ws_err.BadRequestError('table not provided');

    var sysId = request.body.data.sysId || null;
    if (!sysId)
        return new sn_ws_err.BadRequestError('sysId not provided');

    var view = request.body.data.view || null;
    if (!view)
        return new sn_ws_err.BadRequestError('view not provided');

    var state = request.body.data.state || '';
    var isNew = (request.body.data.isNew + '' === 'true') || (sysId === '-1');

    var overviewUtils = new SOWOverviewUtils();
    var result = {
        formData: overviewUtils.getFormSectionsForLayout(table, sysId, view),
        stateFormData: overviewUtils.getSectionsForState(table, sysId, state, isNew),
        versionNumber: gs.getProperty('itsm_family_release_version_check',0)
    };

    return result;
})(request, response);
