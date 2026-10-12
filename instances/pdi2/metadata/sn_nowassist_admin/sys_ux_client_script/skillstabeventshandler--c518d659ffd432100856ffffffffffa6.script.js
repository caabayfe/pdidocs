async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var eventId = event.elementId;
    const eventIndex = event?.context?.item?.index;
    
    const {ModelVersioningUtil} = imports['sn_nowassist_admin.ModelVersioningUtil']();

    const findBySysId = (records, sysId) => {
        return records.findIndex(record => record.sysId === sysId);
    };
    
    const recalculateAllWarnings = async (allSkills, updatedIndex) => {
        // Clear all warnings first
        const clearedSkills = allSkills.map(r => ({ ...r, warning: null }));
        
        // Calculate warning for the UPDATED/NEW record FIRST
        if (updatedIndex !== undefined && updatedIndex !== null) {
            clearedSkills[updatedIndex].warning = await ModelVersioningUtil.getWarningForSkillVersion(clearedSkills, updatedIndex, updatedIndex, helpers);
        }
        
        // Then calculate warnings for all OTHER records in parallel
        const warningPromises = clearedSkills.map((_, i) => 
            i !== updatedIndex ? ModelVersioningUtil.getWarningForSkillVersion(clearedSkills, i, updatedIndex, helpers) : Promise.resolve(null)
        );
        
        const warnings = await Promise.all(warningPromises);
        
        // Apply warnings to other records
        warnings.forEach((warning, i) => {
            if (i !== updatedIndex) {
                clearedSkills[i].warning = warning;
            }
        });
        
        return clearedSkills;
    };

    const updateSkillsAndVersions = async (api, index, newProps) => {
        // Get the record from filtered view
        const filteredRecord = api.state.filteredSkillsVersions[index];
        if (!filteredRecord) return;
        
        const allIndex = findBySysId(api.state.allSkillsVersions, filteredRecord.sysId);
        
        let updatedAll;
        let targetIndex;
        
        if (allIndex === -1) {
            // Record doesn't exist in allSkillsVersions - add it
            const newRecord = {
                ...filteredRecord,
                ...newProps
            };
            updatedAll = [newRecord, ...api.state.allSkillsVersions];
            targetIndex = 0;
        } else {
            // Record exists - update it
            updatedAll = api.state.allSkillsVersions.map((record, i) => ({
                ...record,
                ...(i === allIndex ? newProps : {})
            }));
            targetIndex = allIndex;
        }
        
        // Recalculate all warnings with the updated record as priority
        updatedAll = await recalculateAllWarnings(updatedAll, targetIndex);
        
        // Mark as updated if not a new record
        if (!updatedAll[targetIndex].sysId.startsWith("index")) {
            updatedAll[targetIndex].dataUpdated = true;
        }
        if(newProps.hasOwnProperty("dataUpdated"))
        {
            updatedAll[targetIndex].dataUpdated = newProps.dataUpdated;
        }

        // Update complete dataset
        api.setState("allSkillsVersions", updatedAll);
        
        // Sync filtered view with updated data
        const updatedFiltered = api.state.filteredSkillsVersions.map(record => {
            const idx = findBySysId(updatedAll, record.sysId);
            return idx !== -1 ? updatedAll[idx] : record;
        });
        
        api.setState("filteredSkillsVersions", updatedFiltered);
    };
    
    if (event?.payload?.data?.output?.type === "fetch_models_by_capability") {
        // Transform and update state
        const transformedData = event.payload.data.output.data.reduce((mergedData, obj) => {
            return Object.assign(mergedData, obj);
        }, {});
    
        api.setState("skillsSourceModels", {
            ...api.state.skillsSourceModels,
            ...transformedData
        });

        // Check if there's a pending source model fetch
        const pendingFetch = api.state.pendingSourceModelFetch;
    
        // Check if this was triggered from select_skill (has versionSysId)
        const { versionSysId, capabilityId } = pendingFetch;
        api.setState("pendingSourceModelFetch", null);

        if (versionSysId) {
            const recordIndex = api.state.filteredSkillsVersions?.findIndex(
                record => record.sysId === versionSysId
            );
            
            if (recordIndex !== -1) {
                const record = api.state.filteredSkillsVersions[recordIndex];
                const provider = api.state.supportedProviders?.find(
                    p => p.id === record.genAiProvider
                );
                
                const sourceModelDetails = ModelVersioningUtil.populateSourceModel(
                    transformedData[capabilityId],
                    api.state.modelsAndTypes,
                    provider?.id
                );
                
                await updateSkillsAndVersions(api, recordIndex, {
                    sourceModel: sourceModelDetails?.model ?? null,
                    sourceModelId: sourceModelDetails?.modelId ?? null
                });
            }
        }
    }


    switch (eventId) {
        case "add_new_skill": {
            const currentSkills = api.state.filteredSkillsVersions || [];
            const currentAll = api.state.allSkillsVersions || [];
            const newRecord = {
                sysId: `index-${currentSkills.length + 1}`,
                resource: null,
                sourceModel: null,
                sourceModelId: null,
                targetModel: null,
                targetModelId: null,
                genAiProvider: null,
                skillType: null,
                isEditing: true
            };
            
            // Add to both states (new record at index 0)
            const newAll = [newRecord, ...currentAll];
            const newFiltered = [newRecord, ...currentSkills];
            
            // Recalculate warnings with new record at index 0 as priority
            const updatedAll = await recalculateAllWarnings(newAll, 0);
            
            api.setState("allSkillsVersions", updatedAll);
            
            // Sync filtered view
            const updatedFiltered = newFiltered.map(record => {
                const idx = findBySysId(updatedAll, record.sysId);
                return idx !== -1 ? updatedAll[idx] : record;
            });
            
            api.setState("filteredSkillsVersions", updatedFiltered);
            break;
        }

        case "select_skill": {
            const { value, item } = event.payload || {};
            const { capabilityId, genAiProviderName, type } = item || {};
            
            // Find provider
            const provider = api.state.supportedProviders?.find(p => p.label === genAiProviderName);
            const providerId = provider?.id;
            
            let sourceModelDetails = null;
    
            // Populate source model details (either from existing or newly fetched data)
            if (capabilityId && api.state.skillsSourceModels?.[capabilityId]) {
                sourceModelDetails = ModelVersioningUtil.populateSourceModel(
                    api.state.skillsSourceModels[capabilityId],
                    api.state.modelsAndTypes,
                    providerId
                );
            }
            
            await updateSkillsAndVersions(api, eventIndex, {
                resource: value,
                genAiProvider: providerId ?? null,
                targetModel: null,
                targetModelId: null,
                sourceModel: sourceModelDetails?.model ?? null,
                sourceModelId: sourceModelDetails?.modelId ?? null,
                skillType: type === "oob" ? "ootb" : type ?? null,
                capabilityId: capabilityId ?? null
            });

            // Fetch source models if needed
            if (capabilityId && !api.state.skillsSourceModels?.[capabilityId]) {
                // Get the updated record's sysId (after updateSkillsAndVersions)
                const updatedRecord = api.state.filteredSkillsVersions?.[eventIndex];
                const updatedSysId = updatedRecord?.sysId;

                // Store pending fetch info in state with the NEW sysId
                api.setState("pendingSourceModelFetch", {
                    versionSysId: updatedSysId,  
                    capabilityId: capabilityId
                });

                api.data.get_model_version_data_1.execute({
                    type: "fetch_models_by_capability",
                    payload: {
                        capability: [capabilityId]
                    }
                });
            }
            break;
        }

        case "model_provider":
            await updateSkillsAndVersions(api, eventIndex, {
                targetModel: null,
                targetModelId: null,
                sourceModel: null,
                sourceModelId: null,
                genAiProvider: event.payload.value
            });
            break;

        case "source_model":
            await updateSkillsAndVersions(api, eventIndex, {
                sourceModel: event.payload.value,
                sourceModelId: event.payload?.item?.modelId
            });
            break;

        case "target_model":
            await updateSkillsAndVersions(api, eventIndex, {
                targetModel: event.payload.value,
                targetModelId: event.payload?.item?.modelId
            });
            break;
        case "edit_skill_version":
            await updateSkillsAndVersions(api, eventIndex, {
                isEditing: true,
                dataUpdated: false
            });
            break;
        case "delete_version_click":
            helpers.modal.open('remove_model_version_mapping');
            api.setState("versionToBeDeleted", event.context?.item?.value);
            break;

        default:
            break;
    }
}
