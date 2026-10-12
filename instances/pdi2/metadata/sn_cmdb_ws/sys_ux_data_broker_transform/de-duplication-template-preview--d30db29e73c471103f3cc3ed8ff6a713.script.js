function transform(input) {
    var response = {};
    var templateId = input.templateSysId;
    var taskId = input.taskId;

    var result = sn_cmdb.DuplicateTemplate.preview(templateId, taskId);
    
	response.mergeRelations = result.mergeRelations;
    response.related_tables_merged = result.relatedTablesMerged;
    response.related_tables_merged_count = result.relatedTablesMerged.length;
    response.attributesMap = result.resolvedFieldCIMap;

    if (result.resolvedFieldCIMap) {
        for (var i = 0; i < result.resolvedFieldCIMap.length; i++) {
            var attribute = result.resolvedFieldCIMap[i];
            var fieldValue = _attributeName('sys_id', attribute['sys_id']);
            result.resolvedFieldCIMap[i].value = fieldValue;
            result.resolvedFieldCIMap[i].url = 'cmdb_ci.do?sys_id='+attribute['sys_id']
        }
    }
    response.master_ci_info = {
        'sys_id': result.masterCI,
        'name': _attributeName('sys_id', result.masterCI),
        'url': 'cmdb_ci.do?sys_id='+result.masterCI
    };
    var duplicate_ci_list = [];
    var obj = result.allClassCIMap;
    for (var key in obj) {
        if (Array.isArray(obj[key])) {
            var index = obj[key].indexOf(result.masterCI);
            if (index !== -1) {
                obj[key].splice(index, 1);
            }
            for (var l = 0; l < obj[key].length; l++) {
                duplicate_ci_list.push({
                    'sys_id': obj[key][l],
                    'name': _attributeName('sys_id', obj[key][l]),
                    'url': 'cmdb_ci.do?sys_id='+obj[key][l]
                });
            }
        }
    }
    response.duplicate_ci_info_list = duplicate_ci_list;
    var duplicate_ci_updates = result.duplicateCIUpdates;
    response.duplicate_ci_updates_info = [];
    for (var k = 0; k < duplicate_ci_updates.length; k++) {
        response.duplicate_ci_updates_info.push({
            'element_label': duplicate_ci_updates[k]['element_label'],
			'element_value': duplicate_ci_updates[k]['display'] ? duplicate_ci_updates[k]['display'] : duplicate_ci_updates[k]['value']
        });
    }

    if (result.duplicateCIAction == 'delete') {
        response.deleted_cis_count = duplicate_ci_list.length;
    } else if(result.duplicateCIAction == 'update'){
        response.updated_cis_count = duplicate_ci_list.length;

    }

    function _attributeName(field, sysId) {
        var gr = new GlideRecord('cmdb_ci');
        gr.addQuery(field, sysId);
        gr.query();
        if (gr.next()) {
            return gr.getDisplayValue('name');
        }
        return null;
    }
    return response;
}
