function transform(params) {
    if (gs.nil(params) || gs.nil(params.event_payload) || gs.nil(params.should_execute) || params.should_execute === false)
        return false;

    try {
		if (params.event_payload.event_key === 'isGenAiMultiTaskCancelled') {
			new global.KBInstrumentationSNC().updateSessionInstrumentationValue(params.event_payload.targetTableSysId, 'isGenAiMultiTaskCancelled', true); 
		} else if (params.event_payload.event_key === 'taskList') {
			new global.KBInstrumentationSNC().updateSessionInstrumentationValue(params.event_payload.targetTableSysId, 'taskList', params.event_payload.selectedRecords);
		} else if (params.event_payload.event_key === 'isGeneratedFromCustomTemplateFramework') {
			var isGeneratedFromCustomTemplateFrameworkFlag = new sn_km_gen_ai.KnowledgeGenAIUtils().checkCustomPromptAvailability(params.event_payload.sourceTable, params.event_payload.targetTable); 
            new global.KBInstrumentationSNC().updateSessionInstrumentationValue(params.event_payload.targetTableSysId, 'isGeneratedFromCustomTemplateFramework', isGeneratedFromCustomTemplateFrameworkFlag);
        }
        return true;
    } catch (error) {
        gs.error('RecordPage3ColumnLayoutTelemetry error: ' + error);
        return false;
    }
}
