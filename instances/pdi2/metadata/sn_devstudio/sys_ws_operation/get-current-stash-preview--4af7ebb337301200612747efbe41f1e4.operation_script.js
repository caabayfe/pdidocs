(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var blacklist = [
            'sys_choice',
            'sys_choice_set',
            'sys_ui_list',
            'sys_ui_related_list',
            'sys_ui_section',
            'sys_ui_form',
            'sys_ui_form_section',
            'wf_workflow',
            'wf_workflow_version',
            'cmdb_datasource_definition'
        ],
        result = [],
		conflictUpdateNames = [],
		previewResults = [],
		updateProblems = [],
        isCollision,
        stashedGr,
        stashedXml,
		remoteUpdateSetArr = [],
        updateValues,
        recordValues,
        gr;
	
	var currentStashId = sn_vcs.AppSourceControl
        .getRepository(appId)
        .getCurrentStashPreview().getSysId();

    var updates = sn_vcs.AppSourceControl
        .getRepository(appId)
        .getCurrentStashPreview()
        .getUpdates();
	
	var remoteUpdateSetRec = new GlideRecord('sys_remote_update_set');
	remoteUpdateSetRec.addQuery('parent', currentStashId);
	remoteUpdateSetRec.query();
	while (remoteUpdateSetRec.next()) {
		var remoteUpdateSetId = remoteUpdateSetRec.getValue('sys_id');
		remoteUpdateSetArr.push(remoteUpdateSetId);
	}

    while (updates && updates.next()) {
        isCollision = updates.isCollision();
        if (!isCollision)
            continue;

        stashedGr = new GlideRecord('sys_update_xml');
        stashedXml = stashedGr.get(updates.getSysId());
		conflictUpdateNames.push(updates.getUpdateName());

        updateValues = {
            updateName: updates.getUpdateName(),
            updateSysId: updates.getSysId(),
            stashedFileName: stashedXml ? stashedGr.getValue('target_name') : '',
            action: updates.getAction() === 'DELETE' ? gs.getMessage('deleted') : gs.getMessage('modified'),
            conflict: isCollision,
            referencesMissingTable: updates.referencesMissingTable(),
            isSkip: updates.isSkip(),
            payload: updates.getPayload()
        };

        gr = updates.getCurrentRecord();
        recordValues = gr.isValidRecord() ? getRecordValues(gr) : getPayloadValues(updateValues.payload);

        result.push(_.extend({}, updateValues, recordValues));
    }

    response.setBody({
		result : result,
		hasPreviewProblems : hasPreviewProblems(currentStashId, result),
		remoteUpdateSetArr: remoteUpdateSetArr
	});
	
    response.setStatus(200);
    response.setContentType('application/json');

    function getRecordValues(gr) {
        var tableName, customType;

        tableName = gr.getValue('sys_class_name');
        customType = FileTypeMap.studioTypeForTable(tableName);

        return {
            fileSysId: gr.getValue('sys_id'),
            fileName: gr.getValue('sys_name'),
            table: tableName,
            type: (customType && customType.name) || tableName,
            isBlacklisted: _.contains(blacklist, tableName),
            updatedBy: gr.getDisplayValue('sys_updated_by'),
            updatedOn: gr.getDisplayValue('sys_updated_on')
        };
    }

    function getPayloadValues(payload) {
        var record, tableName, customType;
        record = UpdateXMLPayloadParser.parse(payload);
        tableName = record.sys_class_name;
        customType = FileTypeMap.studioTypeForTable(tableName);

        return {
            fileSysId: record.sys_id,
            fileName: record.sys_name,
            table: tableName,
            type: (customType && customType.name) || tableName,
            isBlacklisted: true,
            updatedBy: record.sys_updated_by,
            updatedOn: record.sys_updated_on
        };
	}
	
	function hasPreviewProblems(currentStashId, result) {		
		var previews = new GlideAggregate('sys_update_preview_problem');
		previews.addAggregate('count', 'sys_id');
		previews.addQuery('remote_update_set.remote_base_update_set', currentStashId);
		previews.orderBy("remote_update.name");
        previews.addNullQuery('status');
        previews.query();
		while(previews.next()) {
			previewResults.push(previews.getValue("remote_update.name"));
		}
		updateProblems = findUnique(previewResults,conflictUpdateNames);
		return ((previews.getRowCount() > conflictUpdateNames.length) && updateProblems.length > 0);
	}
	
	function findUnique(a, b) {
        var c = a.filter(function(item) {
            return b.indexOf(item) === -1;
        });
        return c;
	}


})(request, response);
