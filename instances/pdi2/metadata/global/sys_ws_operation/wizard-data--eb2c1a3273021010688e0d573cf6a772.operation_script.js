(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var targetRecord = request.queryParams.record_id ? request.queryParams.record_id.toString() : undefined;
    var mode = request.queryParams.mode ? request.queryParams.mode.toString() : undefined;
    var templateId = request.queryParams.template_id ? request.queryParams.template_id.toString() : undefined;
	var parentRecordTable = request.queryParams.sysparm_parent_target_record_table ? request.queryParams.sysparm_parent_target_record_table.toString() : undefined;
	var parentRecordId = request.queryParams.sysparm_parent_target_record_id ? request.queryParams.sysparm_parent_target_record_id.toString() : undefined;
	var isTemplateMandatory = request.queryParams.is_template_mandatory ? request.queryParams.is_template_mandatory.toString() : undefined;
    var responseObject;
    try {
        var answerObject = sn_sc.CatalogWizardHandler.fetch({
            wizardId: request.pathParams.sys_id,
            targetRecord: targetRecord,
            mode: mode,
            templateId: templateId,
			parentTargetRecordTable: parentRecordTable,
			parentTargetRecordId: parentRecordId,
			isTemplateMandatory: isTemplateMandatory
        });
        responseObject = JSON.parse(answerObject);
        if (GlidePluginManager.isActive("sn_wwna")) {
            responseObject.skillConfig = new sn_wwna.WWNAUtils().fetchNACMSkillConfiguration(responseObject.skill, responseObject.targetTable, responseObject.targetRecordData.targetRecord);
        }
        responseObject.previewPortal = gs.getProperty('glide.sc.builder.preview_portal_id', 'swp');
    } catch (e) {
        gs.debug(e);
		var catalogExceptionUtils = new global.CatalogExceptionUtils();
		var msg;
		if (catalogExceptionUtils.isCatalogWizardException(e)) {
			msg = e.getMessage() + '';
		} else {
			msg = gs.getMessage('You are not authorized to edit this record.');
		}
        responseObject = {
            errMsg: msg
        };
    }
	
    return responseObject;
})(request, response);
