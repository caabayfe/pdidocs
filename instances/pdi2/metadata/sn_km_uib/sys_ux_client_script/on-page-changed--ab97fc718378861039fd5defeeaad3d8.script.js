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
                api.data.create_duplicate_articles_m2m_records_kcuib_1.execute({
                    "duplicateSysIds":api.context.props.duplicateSysIds,
                    "articleId": event.payload.value
                });
            }
            if (api.state.isGenAiGenerated)
                api.setState('isGenAiModified', true);
        }
    }
}
