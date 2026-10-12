/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const isAgenticAiSourceEnabled = api.state.aiAgentPluginActive && api.state.userInfo.isSnAiaViewer;
    //based on the data fetch result set the sourceTypeInput values
    let sourceTypeValues = api.data.get_choice_sourceType.output.data.GlideChoiceColumn_Query.getChoiceFields;
    sourceTypeValues = sourceTypeValues.filter(type => {
        if(type.rawValue === 'AGENTIC_AI_DATA') {
            return isAgenticAiSourceEnabled;
        } else {
            return type.rawValue !== 'null';
        }
    }).map(type => ({
        id: type.rawValue,
        label: type.displayValue
    }));
    if (event.name == 'DATA_FETCH_SUCCEEDED') {
        api.setState('sourceTypeInput', sourceTypeValues);
    } else {
        sourceTypeValues = sourceTypeValues.filter((data) => data.id !== 'EXTERNAL_DATA');
        api.setState('sourceTypeInput', sourceTypeValues);
    }
}
