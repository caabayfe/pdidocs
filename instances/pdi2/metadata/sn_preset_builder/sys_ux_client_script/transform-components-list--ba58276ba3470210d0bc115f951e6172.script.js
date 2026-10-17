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
    const results = api.data.look_up_multiple_records_1.results;
    const updatedResult = results.map(elem => ({
        id: elem._row_data.uniqueValue || '',
        macroponentSysId: elem.macroponent.value || '',
        label: elem.label.value || ''
    }));
    api.setState('componentsList', updatedResult);

    // The component field is prepopulated when used in Component Builder settings.
    const preselectedComponentMcpId = api.context.props.preselectedComponentMcpId;

    if (!preselectedComponentMcpId) return;

    const selectedComponent = preselectedComponentMcpId && updatedResult.find(({
        macroponentSysId
    }) => macroponentSysId === preselectedComponentMcpId);

    api.setState('selectedComponent', selectedComponent || {});
}
