/**
 * @param {object} params
 * @param {object} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    var functionalGroups = api?.state?.fnGroupProviderMappingdata || [];
    functionalGroups = functionalGroups.sort((firstSkill, secondSkill) => firstSkill.name.localeCompare(secondSkill.name));
    return functionalGroups.map(({ sys_id, name, description, providers, selected_provider, capability_list, capabilitySkills, global_consent, source }) => ({
        id: sys_id,
        label: name,
        sublabel: (description || "").replace(/<\/?[^>]+(>|$)/g, ""),
        providers,
        selectedProvider: selected_provider,
        capabilityList: capability_list,
        skillList: capabilitySkills,
        azureConsentPassed: global_consent,
        source:source
    }));
}
