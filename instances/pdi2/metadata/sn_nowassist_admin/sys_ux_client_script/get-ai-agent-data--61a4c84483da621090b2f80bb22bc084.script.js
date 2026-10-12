/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const { item } = event.context || {};
    const isAIAgentGroupSelected = item?.value?.source === 'ai-agents';
    api.setState('disabledAgenticWorkflow',0)
    api.setState('disabledAgentList',0)
    api.setState('aiAgentList',[])
    if (isAIAgentGroupSelected || event.elementId == 'instance_level_provider_update') {
        var providerId = event.payload?.value
        if (event.elementId == 'skill_group_selector') {
           providerId =  event?.payload?.item?.selectedProvider;
        }
        api.data.fetch_skills_based_on_providers_1.execute({
            type: 'FETCH_AGENT_LIST',
            payload: { providerId }
        });
    }
}
