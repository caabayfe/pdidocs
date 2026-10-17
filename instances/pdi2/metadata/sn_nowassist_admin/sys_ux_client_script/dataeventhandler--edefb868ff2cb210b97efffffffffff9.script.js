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
    const {ModelVersioningUtil} = imports['sn_nowassist_admin.ModelVersioningUtil']()

    var type = event.payload?.data?.output?.type;

    if(event.payload?.selectedTab === "id=skills")
    {
        api.data.get_model_version_data_1.execute({
            type: "fetch_version_records_for_skills",
            payload: {
                providers: api.state.supportedProviders,
                filters: {
                    control: "skill"
                }
            }
        });
        //reset filters and search
        api.setState("searchTerm","");
        api.setState("filters",{});
        api.setState("paginationControls",{currentPage:0,pageSize:10});
    }

    switch (type) {
       case "fetch_version_records":
            {
                api.setState("modelsAndTypes", event.payload.data.output.data.modelsAndTypes);
                api.setState("excludedModelsAndTypes", event.payload.data.output.data.excludedModelsAndTypes);
                // persist the expande status of the providers if they are available in the UI.
                var data = [...api.state.providerAndVersions];
                var newData = event.payload.data.output.data.versions;
                if(data.length>0){
                    data.forEach(provider=>{
                        var matchedItem = newData.filter(item=>item.sysId === provider.sysId)[0];
                        if (matchedItem) {
                            matchedItem.expanded = provider.expanded;
                        }
                    });
                }
                api.setState("providerAndVersions", newData);
                api.setState("hasEditAccess",event.payload.data.output.data.hasEditAccess);
            }
            break;
        case "fetch_version_records_for_skills":
            {
                var versionRecords = event.payload.data.output.data.versions;
                var availableSkills = api.state.availableSkills;
                
                var skillIdToCapabilityMap = {};
                var skillIdToSkillName = {};
                availableSkills.forEach(function(skill) {
                    skillIdToCapabilityMap[skill.id] = skill.capabilityId;
                    skillIdToSkillName[skill.id] = skill.name;
                });
                
                var uniqueCapabilityIds = new Set();
                
                versionRecords.forEach(function(record) {
                    record.capabilityId = skillIdToCapabilityMap[record.resource];
                    record.skillName = skillIdToSkillName[record.resource];
                    if (record.capabilityId) {
                        uniqueCapabilityIds.add(record.capabilityId);
                    }
                });
                
                if (uniqueCapabilityIds.size > 0) {
                    fetchModelsByCapabilityIds(Array.from(uniqueCapabilityIds));
                }
                api.setState("allSkillsVersions",versionRecords);
                const filteredData = ModelVersioningUtil.searchAndFilterData(versionRecords,api.state.searchTerm,api.state.filters);
                api.setState("filteredSkillsVersions",filteredData);
            }
            break;
        case "FETCH_ALLOWED_PROVIDERS_FROM_AICT":
            {
                var providers = event.payload.data.output.output;
                if (providers && providers.allProviders) {
                    api.setState("supportedProviders", providers.allProviders);
                    fetchAllModelVersions(providers.allProviders);
                }
            }
            break;
        case "remove_model_version_mapping":
        case "create_update_versions":
            {
                if (type === "create_update_versions") {
                    if(api.state.tabScope.indexOf("instance")>-1)
                    {
                        fetchAllModelVersions(api.state.supportedProviders);
                    }
                    else{
                        fetchAllModelVersionsForSkills(api.state.supportedProviders);
                    }
                } else {
                    // remove the deleted version from memory
                    if(api.state.tabScope.indexOf("instance")>-1)
                    {
                        var versionsData= [...api.state.providerAndVersions];
                        var deletedVersionProvider = versionsData.filter(item=>item.sysId===api.state.versionToBeDeleted.genAiProvider)[0];
                        deletedVersionProvider.versions=deletedVersionProvider.versions.filter(item=>item.sysId!==api.state.versionToBeDeleted.sysId);
                        api.setState("providerAndVersions",versionsData);
                    }
                    else{
                        var versionsData= [...api.state.filteredSkillsVersions];
                        var versionsAfterDelete = versionsData.filter(item=>item.sysId!==api.state.versionToBeDeleted.sysId);
                        api.setState("filteredSkillsVersions",versionsAfterDelete);
                        var allVersionsData = [...api.state.allSkillsVersions];
                        var allVersionsAfterDelete = allVersionsData.filter(item => item.sysId !== api.state.versionToBeDeleted.sysId);
                        api.setState("allSkillsVersions", allVersionsAfterDelete);
                    }
                }
                if(event.payload.data.output.response.status==="Success")
                {
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "update_success",
                        status: "positive",
                        icon: "circle-info-outline",
                        header: type === "remove_model_version_mapping" ? "" : await helpers.translate("Changes saved"),
                        content: {
                            type: "html",
                            value: type === "remove_model_version_mapping" 
                                ? await helpers.translate("Successfully deleted version.") 
                                : await helpers.translate("Model version updates have been applied successfully.")
                        },
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
                }
                else{
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "update_error",
                            status: "critical",
                            icon: "circle-check-outline",
                            content: {
                                type: "html",
                                value: type === "remove_model_version_mapping" ? await helpers.translate("Failed to delete version. Please try again.") : await helpers.translate("Failed to update versions. Please try again.")
                            },
                            action: {
                                type: 'dismiss'
                            }
                        }]
                    });
                }
            }
            break;

        default:
            break;
    }

    function fetchAllModelVersions(providers) {
        api.data.get_model_version_data_1.execute({
            type: "fetch_version_records",
            payload: {
                providers: providers,
                filters: {
                    control: "instance"
                }
            }
        });
    }
    function fetchAllModelVersionsForSkills(providers) {
        api.data.get_model_version_data_1.execute({
            type: "fetch_version_records_for_skills",
            payload: {
                providers: providers,
                filters: {
                    control: "skill"
                }
            }
        });
    }
    function fetchModelsByCapabilityIds(capabilityIds)
    {
        api.data.get_model_version_data_1.execute({
            type: 'fetch_models_by_capability',
            payload: {
                capability: [...capabilityIds]
            }
        });
    }
   
}
