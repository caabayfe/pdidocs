function transform(params) {
    if (!GlidePluginManager.isActive("sn_km_gen_ai"))
        return {
            success: false
        };

    if (gs.nil(params) || gs.nil(params.source_table) || gs.nil(params.target_table) || gs.nil(params.should_fetch) || params.should_fetch === false || gs.nil(params.target_table_sys_id))
        return {
            success: false
        };

    var inputTasks = [];
    var inputTable = params.source_table;

    if (!gs.nil(params.source_sys_id)) {
        inputTasks.push(params.source_sys_id);
    }
    if (!gs.nil(params.extra_sources)) {
        for (var id in params.extra_sources) {
            inputTasks.push(id);
        }
    }

    var proceed = false;
    if (inputTasks.length > 0) {
        var sourceGr = new GlideRecord(params.source_table);
        if (sourceGr.get(inputTasks[0])) {
            inputTable = sourceGr.getValue('sys_class_name');
            proceed = true;
        }
    }

    if (!proceed) {
        return {
            success: false
        };
    }

	var targetLanguage = params.target_language;
	targetLanguage = (targetLanguage != '') ? targetLanguage : null;

    var answer = null;

    if (inputTasks.length === 1) {
        answer = new sn_km_gen_ai.KMNowAssistInProductUtils().generateArticleFields(inputTable, inputTasks[0], params.target_table, params.target_table_sys_id, 'Workspace', targetLanguage);

        return {
            success: true,
			isAsync: false,
            content: answer
        };
    } else if (inputTasks.length <= 6) {
        answer = new sn_km_gen_ai.KMNowAssistInProductUtils().generateMultiTaskArticleFields(inputTasks, params.source_table, params.target_table, params.target_table_sys_id, 'Workspace', targetLanguage);
        return {
            success: true,
			isAsync: true,
            content: params.target_table_sys_id
        };
    }
}
