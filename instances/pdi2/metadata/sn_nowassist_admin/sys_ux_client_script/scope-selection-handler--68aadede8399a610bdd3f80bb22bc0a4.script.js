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
    var scopeTypeSelection = event.elementId == 'customize_grid_selection' ? 'customize' : 'instanceLevel';

    api.setState('scopeTypeSelection', scopeTypeSelection);
     api.setState('showInstanceImpactCount', false);
    api.setState('disableSaveAndActive', true);
    api.setState('customSelectedItems', []);
    api.setState('instanceLevelProviderUpdatePayload', null);
    api.setState('instaceLevelSectedProvider', '');
    api.setState('skillList', []);

    api.setState('filteredSkillList', []);
    api.setState('filteredSkillListCount', 0);
    api.setState('searchTerm', null);
    api.setState('disabledAgenticWorkflow', 0)
    api.setState('disabledAgentList', 0)
    api.setState('aiAgentList', [])
    if (scopeTypeSelection == 'instanceLevel') {
        api.setState('interruptionModalSize', 'fullscreen')
    } else if (scopeTypeSelection == 'customize') {
        api.setState('interruptionModalSize', 'lg')
        if (!api?.state?.fnGroupProviderMappingdata) {
            api.data.fetch_skills_based_on_providers_1.execute({
                "type": "fetch_fn_group_provider_data",
            });
        }

    }

}
