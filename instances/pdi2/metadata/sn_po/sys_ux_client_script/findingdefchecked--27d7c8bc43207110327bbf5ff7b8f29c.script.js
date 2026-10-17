/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
if (event.elementId === 'rule_based_finding_list' || event.elementId === 'automated_finding_list') {
        let selectedFindingDefs = Object.keys(event.payload.selectedRows);
        const newSelections = {
            ...api.state.selectedTemplateIds,
            [event.elementId]: selectedFindingDefs
        };
        api.setState('selectedTemplateIds', newSelections);
    } else {
        if (event.elementId === 'rule_based_template_list') {
            api.setState('ruleBasedIds', Object.keys(event.payload.selectedRows));
        } else {
            api.setState('automatedIds', Object.keys(event.payload.selectedRows));
        }
    }
}
