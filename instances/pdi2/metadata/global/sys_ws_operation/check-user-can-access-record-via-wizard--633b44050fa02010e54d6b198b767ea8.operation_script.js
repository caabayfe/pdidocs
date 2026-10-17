(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var targetRecord = request.pathParams.record_id ? request.pathParams.record_id.toString() : undefined;
	var wizardId = request.pathParams.wizard_id ? request.pathParams.wizard_id.toString() : 'undefined';
    var mode = request.queryParams.mode ? request.queryParams.mode.toString() : 'normal';
	var checkEdit = request.queryParams.check_edit ? request.queryParams.check_edit.toString() : 'undefined';
    var canAccess = true;
    try {
        canAccess = sn_sc.CatalogWizardHandler.canAccessTarget({
            wizardId: wizardId,
            targetRecord: targetRecord,
            mode: mode, 
			checkEdit: checkEdit,
        });
    } catch (e) {
        throw new sn_ws_err.BadRequestError(e.getMessage() + '');
    }

    return canAccess;
})(request, response);
