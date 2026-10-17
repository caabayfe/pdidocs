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
    
    // api.data.set_azure_global_consent_data.execute({
    //     capability_type: api.state.currentCapablityGroup.id,
    //     value: true
    // });

    var capabilityGroups = [...api.state.capabilityGroups];
    var selectedGroup = capabilityGroups.find(item => item.sys_id === api.state.currentCapablityGroup.sys_id);
    if (selectedGroup) {
        selectedGroup.azureConsentPassed = true;
    };
    var input = {
        providerConfiguration: selectedGroup
    };

    api.data.set_llm_provider_for_capabilities.execute(input);
    api.setState("capabilityGroups", capabilityGroups);
}
