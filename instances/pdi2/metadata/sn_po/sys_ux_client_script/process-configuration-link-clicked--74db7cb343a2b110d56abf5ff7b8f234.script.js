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
    helpers.navigate.to('process-configuration-details', {
        processId: api.state.processConfigId,
        step: 'improvement-opportunities',
    }, {
        activeTab: event.elementId === 'rule_based_template_list' ? "RULE_BASED" : "AUTOMATED"
    }, true);
    
    helpers.modal.close("[component-id$='add_from_library']");
}
