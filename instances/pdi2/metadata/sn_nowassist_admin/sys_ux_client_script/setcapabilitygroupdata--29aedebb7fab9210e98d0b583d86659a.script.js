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
    var configurations = api.data.fetch_provider_configurations.output;
    var capabilityGroupData = [];
    var prevCapabilityGroup = {};
    configurations?.forEach(item => {
        var providerData = [];
        item.providers?.forEach(providerItem => {
            providerData.push({
                id: providerItem.id,
                label: providerItem.label?.indexOf("Now LLM")> -1 ? "Now LLM Service" : providerItem.label,
                sys_id: providerItem.sys_id
            })
        });
        prevCapabilityGroup[item.sys_id] = item.selected_provider;
        capabilityGroupData.push({
            sys_id: item.sys_id,
            header: item.name,
            subHeader: item.description,
            upStreamRouting: item.upstream_routing,
            capabilityList: item.capability_list,
            selectedProvider: item.selected_provider,
            azureConsentPassed: item.global_consent,
            messages: item.messages,
            providers: providerData,
            enableSave: false,
            domain: item.domain
        })
    });    
    api.setState("capabilityGroups", capabilityGroupData);
    api.setState("prevCapabilityGroup",prevCapabilityGroup);
}
