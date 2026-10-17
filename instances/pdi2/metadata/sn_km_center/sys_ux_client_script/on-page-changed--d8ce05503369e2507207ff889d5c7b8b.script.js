/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.name == "MACROPONENT_PROPERTY_CHANGED") {
        if (event.payload && event.payload.name == "sysId" && event.payload.previousValue == "-1") {
            if(api.context.props.duplicateSysIds) {
                api.data.create_duplicate_articles_m2m_records_1.execute({
                    "duplicateSysIds":api.context.props.duplicateSysIds,
                    "articleId": event.payload.value
                });
            }

            if (api.state.temporarySysId) {
                api.data.update_knowledge_center_temporary_asset_sysid_1.execute({
                    temporarySysId: api.state.temporarySysId,
                    articleId: event.payload.value
                });
            }

            if (api.state.isGenAiGenerated)
                api.setState('isGenAiModified', true);
            
            // New article saved for first time, trigger asset save logic
            api.setState('lastSavedTimestamp', Date.now());
            
            api.data.set_editor_type_1.execute({        	
		        table: api.context.props.table,
		        recordId: api.context.props.sysId,
		        templateFields: 'editor_type=ECE',
		        seSetDisplayValue: null
            });

        }
    }
}
