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
    const eventId = event.elementId;
    const isInstanceTab = api.state.tabScope.indexOf("instance") > -1;
    switch (eventId) {
        case "save_and_continue":
            isInstanceTab ? saveAndContinue() : helpers.modal.open("confirm_skill_update");
            break;
        case "confirm_skill_update":
            saveAndContinue();
            break;
        default:
            break;
    }


    function saveAndContinue() {
        if (isInstanceTab) {
            var data = [];
            api.state.providerAndVersions.forEach(provider => {
                provider.versions.forEach(version => {
                    var operation;
                    if (version.sysId.indexOf("index") > -1) {
                        operation = "CREATE";
                    } else if (version.dataUpdated) {
                        operation = "UPDATE";
                    }
                    if (operation) {
                        var sourceModel = getSourceModelAndType(version);
                        var record = {
                            operation: operation,
                            source_model_name: sourceModel.sourceModel,
                            target_model_name: version.targetModelId,
                            gen_ai_provider: provider.sysId,
                            skill_type: version.skillType,
                            model_type: sourceModel.modelType,
                            control: "instance"
                        };
                        if (operation === "UPDATE") {
                            record.sys_id = version.sysId;
                        }
                        data.push(record);
                    }
                });
            });
            api.data.set_model_version_data_1.execute({
                payload: data,
                type: "create_update_versions"
            });
        } else {
            var data = [];
            api.state.allSkillsVersions.forEach((skill) => {
                var operation;
                if (skill.sysId.indexOf("index") > -1) {
                    operation = "CREATE";
                } else if (skill.dataUpdated) {
                    operation = "UPDATE";
                }
                if (operation) {
                    var sourceModel = getSourceModelAndType(skill);
                    const record = {
                        operation: operation,
                        source_model_name: sourceModel.sourceModel,
                        target_model_name: skill.targetModelId,
                        gen_ai_provider: skill.genAiProvider,
                        control: "skill",
                        skill_type: skill.skillType,
                        model_type: sourceModel.modelType,
                        resource: skill.resource,
                        resource_type: "sn_nowassist_skill_config",
                    };
                    if (operation === "UPDATE")
                        record.sys_id = skill.sysId;
                    data.push(record);
                }
            });
            api.data.set_model_version_data_1.execute({
                payload: data,
                type: "create_update_versions"
            });
        }
    }
    /**
     * Return the source model and model types
     * If source model is All, Then we need to pass null to the backend.
     */
    function getSourceModelAndType(version) {
        switch (version.sourceModelId) {
            case "llm":
                {
                    return {
                        sourceModel: null,
                        modelType: "LLM"
                    };
                }
                break;
            case "slm":
                {
                    return {
                        sourceModel: null,
                        modelType: "SLM"
                    };
                }
                break;
            case "generic":
                {
                    return {
                        sourceModel: null,
                        modelType: "GENERIC"
                    };
                }
                break;
            default:
                {
                    var sourceModelType = api.state.modelsAndTypes.filter(item => item.model === version.sourceModel)[0];
                    var targetModelType = api.state.modelsAndTypes.filter(item => item.model === version.targetModel)[0];
                    var finalModelType = "GENERIC";

                    // If the source and target model types are same, send model type as source. Else send it as GENERIC
                    if (sourceModelType.modelType === targetModelType.modelType) {
                        finalModelType = sourceModelType.modelType;
                    }
                    return {
                        sourceModel: version.sourceModelId,
                        modelType: finalModelType
                    };
                }
                break;
        }
    }
}
