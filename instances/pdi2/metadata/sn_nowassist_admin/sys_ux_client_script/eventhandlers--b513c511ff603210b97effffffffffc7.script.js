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
    var elementId = event.elementId;

    switch (elementId) {
        case "models_expand_button":
            {
                var providerId = event.context.item.value.sysId;
                var providerData = [...api.state.providerAndVersions];
                providerData.filter(item => item.sysId === providerId)[0].expanded = !providerData.filter(item => item.sysId === providerId)[0].expanded;
                api.setState("providerAndVersions", providerData);
            }
            break;
        case "add_model_version":
            {
                var providerId = event.context.item.value.sysId;
                var providerData = [...api.state.providerAndVersions];
                var currentProvider = providerData.filter(item => item.sysId === providerId)[0];
                var newVersionRecord = {
                    modelType: "",
                    sourceModel: null,
                    targetModel: null,
                    sysId: `${providerId}-index-${currentProvider.versions.length+1}`,
                    isEditing: true,
                    oobVersion: false,
                    skillType: api.state.skillScope,
                    genAiProvider: providerId,
                };
                currentProvider.versions.unshift(newVersionRecord);
                api.setState("providerAndVersions", providerData);
            }
            break;
        case "target_model_select":
        case "source_model_select":
            {
                if (event.context.item.parent) {
                    var providerId = event.context.item.parent.value.sysId;
                    var providerData = [...api.state.providerAndVersions];
                    var currentProvider = providerData.filter(item => item.sysId === providerId)[0];
                    var versionRecord = currentProvider.versions.filter(item => item.sysId === event.context.item.value.sysId)[0];
                    var key = "targetModel";
                    var modelIdKey = "targetModelId";
                    if (elementId === "source_model_select") {
                        key = "sourceModel";
                        modelIdKey = "sourceModelId";
                        if(event.context.item.parent?.value?.versions.some(item=>item.oobVersion && item.sourceModel === event.payload.value))
                        {
                            helpers.modal.open("servicenow_config_override");
                        }
                    }
                    versionRecord[modelIdKey] = event.payload.item.modelId;
                    versionRecord[key] = event.payload.value;
                    versionRecord.dataUpdated = true;
                    versionRecord.warning = await getWarnings(currentProvider, versionRecord);
                    api.setState("providerAndVersions", providerData);
                    api.setState("currentEditingVersion",versionRecord);
                }
            }
            break;
        case "edit_instance_version":
            if (event.context.item.parent) {
                    var providerId = event.context.item.parent.value.sysId;
                    var providerData = [...api.state.providerAndVersions];
                    var currentProvider = providerData.filter(item => item.sysId === providerId)[0];
                    var versionRecord = currentProvider.versions.filter(item => item.sysId === event.context.item.value.sysId)[0];
                    versionRecord.isEditing= true;
                    api.setState("providerAndVersions", providerData);
                }
            break;
        case "delete_skill_version_click":
        case "delete_version_click":
            {
                api.setState("versionToBeDeleted", event.context.item.value);
            }
            break;
        case "remove_model_version_mapping":
            {
                if (api.state.versionToBeDeleted && api.state.versionToBeDeleted.sysId.indexOf("index") === -1) {
                    var versionToBeDeleted = {
                        operation: "DELETE",
                        sys_id: api.state.versionToBeDeleted.sysId
                    };
                    api.data.set_model_version_data_1.execute({
                        payload: [versionToBeDeleted],
                        type: "remove_model_version_mapping"
                    });
                } else {
                    if (api.state.tabScope.indexOf("instance") > -1) {
                        var versionsData = [...api.state.providerAndVersions];
                        var deletedVersionProvider = versionsData.filter(item => item.sysId === api.state.versionToBeDeleted.genAiProvider)[0];
                        deletedVersionProvider.versions = deletedVersionProvider.versions.filter(item => item.sysId !== api.state.versionToBeDeleted.sysId);
                        api.setState("providerAndVersions", versionsData);
                    } else {
                        var versionsData = [...api.state.filteredSkillsVersions];
                        var versionsAfterDelete = versionsData.filter(item => item.sysId !== api.state.versionToBeDeleted.sysId);
                        api.setState("filteredSkillsVersions", versionsAfterDelete);
                        var allVersionsData = [...api.state.allSkillsVersions];
                        var allVersionsAfterDelete = allVersionsData.filter(item => item.sysId !== api.state.versionToBeDeleted.sysId);
                        api.setState("allSkillsVersions", allVersionsAfterDelete);
                    }
                }
            }
            break;
        default:
            break;
    }

    async function getWarnings(currentProvider, versionRecord) {
        if (versionRecord.sourceModel === versionRecord.targetModel) {
            delete versionRecord.errorType;
            return await helpers.translate("Default and Target cannot be same. Please select a different combination.");
        } else if (currentProvider.versions.some(item => item.sourceModel === versionRecord.sourceModel &&
                item.targetModel === versionRecord.targetModel &&
                item.oobVersion &&
                 item.sysId !== versionRecord.sysId &&
                item.skillType === versionRecord.skillType)) {
            delete versionRecord.errorType;
            return await helpers.translate("The selection is existing default configuration from ServiceNow. Please select a different combination.");
        } else if (currentProvider.versions.some(item => 
                item.sourceModel === versionRecord.sourceModel &&
                item.sysId !== versionRecord.sysId &&
                item.skillType === versionRecord.skillType &&
                !item.oobVersion
            )) {
            versionRecord.errorType = "CONFLICTING_TARGET";
            return await helpers.translate(`A configuration for ${versionRecord.sourceModel} already exists. Please select a different default model version.`);
        } else if (currentProvider.versions.some(item => item.sourceModel === versionRecord.sourceModel &&
                item.targetModel === versionRecord.targetModel &&
                item.sysId !== versionRecord.sysId &&
                item.skillType === versionRecord.skillType)) {
            delete versionRecord.errorType;
            return await helpers.translate("The selected options is an existing configuration. Please select a different combination.");
        } else if (currentProvider.versions.some(item => item.sourceModel === versionRecord.targetModel &&
                item.targetModel === versionRecord.sourceModel &&
                item.sysId !== versionRecord.sysId &&
                item.skillType === versionRecord.skillType)) {
            versionRecord.errorType = "INTERCHANGED";
            return await helpers.translate("The selected options are interchanged with default model version and target model version. Please select a different combination.");
        }
        delete versionRecord.errorType;
        return null;
    }
}
