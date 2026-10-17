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
    // Show the model if provider is not Now LLM.
    var selectedGroup = event.context.item?.value;
    var isLLMProviderSelected = selectedGroup?.providers?.filter(item => item.id === selectedGroup?.selectedProvider)[0].label === "Now LLM Service";
    var input = {
        providerConfiguration: selectedGroup
    };
    if (isLLMProviderSelected) {
        api.data.set_llm_provider_for_capabilities.execute(input);
    } else {
        if (!selectedGroup?.azureConsentPassed) {
            api.data.is_model_available_for_capabilities.execute({
                capabilityList: selectedGroup?.capabilityList,
                providerSysId: selectedGroup?.selectedProvider
            });
        } else {
            api.data.set_llm_provider_for_capabilities.execute(input);
        }
    }
    api.setState("currentCapablityGroup", selectedGroup);
}
