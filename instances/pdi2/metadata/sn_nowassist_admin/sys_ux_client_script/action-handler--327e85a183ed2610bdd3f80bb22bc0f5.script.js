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
    const eventName = event.name;
    const items = api.state.customSelectedItems || [];
    const currentItem = items[event?.context?.item?.index] || api?.state?.selectedGroup;


    switch (eventName) {
        case "DATA_OP_INITIATED":
            api.setState("hideLoader", false);
            break;

        case "DATA_OP_SUCCEEDED":
            handleDataOpSucceeded(event, currentItem, items);
            break;

        case "NOW_BUTTON_ICONIC#CLICKED":
            if (event.elementId === 'show_fn_group_skills_button') {
                toggleSkillListVisibility(items, event.context.item.index);
            } else if (event.elementId == 'hide_failed_oob_skill_list') {
                api.setState('hideFailedOOBSkillList', !api?.state?.hideFailedOOBSkillList);
            }
            else if (event.elementId == 'hide_success_list_on_intruption_modal') {
                api.setState('hideSuccessOOBSkillList', !api?.state?.hideSuccessOOBSkillList);
            } else if (event.elementId == 'hide_failed_agent_and_agentic_workflow_list') {
                api.setState('hideAgentAndAgenticWorkFlowFailedList', !api.state.hideAgentAndAgenticWorkFlowFailedList)
            }


            break;

        case "NOW_SELECT#SELECTED_ITEM_SET":
            handleItemSelection(event, currentItem);
            updateRepeaterData(items);
            break;

        case "NOW_BUTTON#CLICKED":
            handleButtonClick(event, currentItem, items);
            break;

        case "NOW_CHECKBOX#CHECKED_SET":
            handleCheckBox(event)
        default:
            api.setState("hideLoader", true);
    }

    // ========== Helper Functions ==========

    function handleDataOpSucceeded(event, currentItem, items) {
        const {
            elementId,
            payload
        } = event;
        if (elementId === 'is_model_available_for_capabilities') {
            const output = payload?.data?.output;
            if (!output) {
                api.setState('disableSaveAndActive', true);
                helpers.modal.open("change_provider_modal");
            } else {
                api.setState('disableSaveAndActive', false);
            }
        } else if (elementId === 'set_llm_provider_for_capabilities') {
            processProviderUpdate(payload?.data?.output || []);
        } else if (elementId === 'fetch_skills_based_on_providers_1') {
            processFetchedInput(event?.payload?.data?.output);
        }
    }

    function processFetchedInput(data) {
        if (data?.fnGroupProviderMappingData && data.fnGroupProviderMappingData.length > 0) {
            data.fnGroupProviderMappingData.forEach(item => {
                var functionalGroupSKills = [];

                item.capability_list.forEach(capability => {
                    const groupCapabilitySkill = api.state.skillCapabilityMapping[capability];
                    if (groupCapabilitySkill) {
                        functionalGroupSKills.push(groupCapabilitySkill)
                    }
                });

                item.capabilitySkills = functionalGroupSKills.flat();
            });
            api.setState('fnGroupProviderMappingdata', data.fnGroupProviderMappingData);

            if (api?.state?.pageParams?.groupId) {
                const targetSysId = api?.state?.pageParams?.groupId;
                const groupData = data.fnGroupProviderMappingData.find(item => item.sys_id === targetSysId);
                addSelectedGroupToRepeater(groupData);
            }
        } else if (data?.skillCapabilityMapping) {
            api.setState('skillCapabilityMapping', data.skillCapabilityMapping);
            api.setState('aictApprovedProviders', data.aictProvider.providers);
            api.setState('fallback', data.aictProvider.fallback);
            api.setState('routing', data.aictProvider.routing);
            api.setState("errorMessages", data.errorMessages)

            if (api?.state?.pageParams?.skillId) {
                const targetSkillId = api?.state?.pageParams?.skillId;
                let skillData = null;
                for (const key in data.skillCapabilityMapping) {
                    const match = data.skillCapabilityMapping[key].find(item => item.id === targetSkillId);
                    if (match) {
                        skillData = match;
                        break;
                    }
                }
                if (skillData) {
                    addSkillFromPageParams(skillData, data.skillCapabilityMapping);
                }

            }
            
        } else if (data?.skillConsent == false) {
            helpers.modal.open("[component-id$='skill_consent_modal']");
        } else if (data?.skillConsent == true) {
            api.setState('disableSaveAndActive', false);
        } else if (data?.type == 'FETCH_AGENT_LIST') {

            api.setState('aiAgentList', data.agentList);
            api.setState('disabledAgentList', data.disabledAgentList);
            api.setState('disabledAgenticWorkflow', data.disabledAgenticWorkflow);


        }
    }

    function toggleSkillListVisibility(items, index) {
        items[index].showFnGroupSkillList = !items[index].showFnGroupSkillList;
        updateRepeaterData(items);
    }

    function handleItemSelection(event, currentItem) {
        const payload = event.payload.item;
        if (event.elementId === 'provider_selection_component') {

            if (currentItem?.capabilityList?.length > 0 || currentItem?.skillList.length > 0) {
                api.setState('disableSaveAndActive', false);
            }
            currentItem.selectedProvider = payload.id;
            currentItem.currentProvider = payload;
            if (currentItem.selectionType != 'oobSkill') {
                checkForModalAvailability(currentItem)
            }
            api.setState('currentSelectedProvider', payload);
            api.setState('disableSaveAndActive', isValidUserActions(items))


        } else if (event.elementId === 'skill_group_selector') {
            const selected = payload.providers.find(p => p.id === payload.selectedProvider);
            Object.assign(currentItem, {
                selectedProvider: selected?.id,
                currentProvider: selected,
                providers: payload.providers,
                skillList: payload.skillList,
                capabilityList: payload.capabilityList,
                azureConsentPassed: payload.azureConsentPassed,
                sys_id: payload.id,
                label: payload.label,
                capabilityId: payload.capabilityId,
                source: payload?.source,

            });
            if (currentItem?.capabilityList?.length > 0 || currentItem?.skillList.length > 0) {
                api.setState('disableSaveAndActive', false);
            }

            var isAiAgentType = checkForAgentGroup(items);

            if (!isAiAgentType) {
                api.setState('disabledAgenticWorkflow', [])
                api.setState('disabledAgentList', [])
                api.setState('aiAgentList', []);
            }
            api.setState('disableSaveAndActive', isValidUserActions(items))

        } else if (event.elementId === 'instance_level_provider_update') {
            const capabilityList = Object.keys(api.state.skillCapabilityMapping).filter(key => {
                const value = api.state.skillCapabilityMapping[key];
                return value[0]?.providerId !== payload.id;
            });
            const selectedProvider = payload.id;

            //
            var skillList = Object.values(api.state.skillCapabilityMapping).flat()
                .filter(skill => skill?.id)
                .map(skill => ({
                    ...skill,
                    selectionType: 'instanceLevel',
                    userSeletedProvider: payload?.label || '',
                    userSeletedProviderId: payload?.id || ''
                }));
            const filteredSkillList = skillList.filter(item =>
                item.providerId !== item.userSeletedProviderId
            );
            var skillGroupData = api.state.fnGroupProviderMappingdata;

            skillGroupData?.forEach(group => {
                addSelectedGroupToRepeater(group);
            });


            //

            api.setState('instanceLevelProviderUpdatePayload', [{
                'capabilityList': capabilityList,
                'selectedProvider': selectedProvider,
                'selectionType': 'instanceLevel',
                'provider': payload
            }])
            api.setState('instaceLevelSkillList', filteredSkillList)
            api.setState('skillList', filteredSkillList)
            api.setState('instaceLevelSectedProvider', payload?.id)
            api.setState('disableSaveAndActive', false);
            api.setState('showInstanceImpactCount', true);


        }
    }

    function handleButtonClick(event, currentItem, items) {
        switch (event.elementId) {
            case 'agree_azure_consent_button':
                api.setState('disableSaveAndActive', false);
                const selectedItem = items.find(item => item.sys_id === currentItem.sys_id);
                selectedItem.azureConsentPassed = true;
                updateRepeaterData(items)
                break;

            case 'save_selection':
                if (api?.state?.instanceLevelProviderUpdatePayload?.length > 0) {
                    let skillList = api.state.instaceLevelSkillList;
                    var requestPayLoad = api?.state?.instanceLevelProviderUpdatePayload;
                    var instanceLevelCapabilities = requestPayLoad?.[0]?.capabilityList || [];
                    const repeaterItems = api?.state?.customSelectedItems || [];
                    repeaterItems.forEach(({ skillList: skills = [], selectionType, currentProvider, azureConsentPassed, sys_id, label, capabilityList, source }) => {
                        instanceLevelCapabilities = instanceLevelCapabilities.filter(id => !capabilityList.includes(id));
                        requestPayLoad.push({
                            'capabilityList': capabilityList,
                            'source': source,
                            'azureConsentPassed': azureConsentPassed,
                            'groupName': label,
                            'selectedProvider': requestPayLoad[0]?.selectedProvider || '',
                            'selectionType': selectionType,
                            'sys_id': sys_id,
                        });
                    });

                    requestPayLoad[0].capabilityList = instanceLevelCapabilities;

                    api.data.set_llm_provider_for_capabilities.execute({
                        providerConfiguration: requestPayLoad,
                        skillList: skillList
                    });
                } else {
                    let skillList = [];
                    const repeaterItems = api?.state?.customSelectedItems || [];

                    var skillGroupData = {}
                    repeaterItems.forEach(({ skillList: skills = [], selectionType, currentProvider, azureConsentPassed, sys_id, label, capabilityList, source }) => {
                        if (selectionType == 'oobSkillGroup') {
                            skillGroupData[sys_id] = {
                                'capabilityList': capabilityList,
                                'source': source,
                                'azureConsentPassed': azureConsentPassed,
                                'groupName': label,
                                'selectedProvider': currentProvider?.id || '',
                                'selectionType': selectionType,
                                'sys_id': sys_id,
                            };

                        }
                        skills.forEach(skill => {
                            const existingIndex = skillList.findIndex(s => s.id === skill.id);
                            var enrichedSkill = {
                                ...skill,
                                selectionType,
                                capabilityList,
                                selectedProvider: currentProvider?.id || ''

                            };


                            if (existingIndex !== -1) {
                                skillList[existingIndex] = { ...skillList[existingIndex], ...enrichedSkill };
                            } else {
                                skillList.push(enrichedSkill);
                            }
                        });

                    });
                    const grouped = {};
                    var updatedSkillList = [];

               var data ={ ...api.state?.skillCapabilityMapping }
                    skillList.forEach(skill => {
                        for (const key in data) {
                            const items = data[key];
                            items.forEach(item => {
                                if (item.id == skill.id) {
                                   
                                        addAllCapabilitySkills(items, updatedSkillList, skill.selectionType, skill.selectedProvider, data)

                                    

                                }
                            });
                        }
                    });


                    var capabilityList = [];

                    updatedSkillList.forEach(item => {
                        if (item.selectionType == 'oobSkillGroup')
                            return;
                        const groupKey = item.selectedProvider;
                        var capabilityList = item?.capabilityList?.length > 0 ? item?.capabilityList : [];

                        if (!grouped[groupKey]) {
                            grouped[groupKey] = {
                                selectedProvider: item.selectedProvider,
                                selectionType: item.selectionType,
                                sys_id: item.sys_id,
                                capabilityList: capabilityList
                            };


                        }
                        if (grouped[groupKey].capabilityList.indexOf(item.capabilityId) == -1) {
                            grouped[groupKey].capabilityList.push(item.capabilityId);
                        }

                    });

                    // Convert to request payload

                    const finalGroupedData = [...Object.values(grouped), ...Object.values(skillGroupData)];
                    const requestPayload = Object.values(finalGroupedData).map(group => {

                        return {
                            selectedProvider: group.selectedProvider,
                            selectionType: group.selectionType,
                            sys_id: group.sys_id,
                            groupName: group.groupName,
                            azureConsentPassed: group.azureConsentPassed,
                            capabilityList: Array.from(group.capabilityList),
                            source: group.source
                        };
                    });


                    api.setState('skillList', skillList)
                    api.data.set_llm_provider_for_capabilities.execute({
                        providerConfiguration: requestPayload,
                        skillList: updatedSkillList
                    });
                }

                api.setState('disableSaveAndActive', true);
                break;

            case 'skill_consent_agree_and_enable':
                api.data.fetch_skills_based_on_providers_1.execute({
                    "type": "set_consent_for_skills",
                    "payload": {
                        "skillList": currentItem.skillList,
                        "providerId": api.state.currentSelectedProvider.id
                    }
                });

                break

            case 'interruption_modal_okay_button':
                api.emit("NAV_ITEM_SELECTED", {
                    route: 'manage-llm-providers',
                    params: {
                        'selectedTab': 1
                    },
                    reload: true
                });
                break
        }
    }

    function handleCheckBox(event) {
        const elementId = event.elementId;
        switch (elementId) {
            case "skill_level_consent_checkbox":
                api.setState("disableSkillConsentButton", !event?.payload?.value);
                break;
            default:

        }

    }

    function updateRepeaterData(data) {
        api.setState('customSelectedItems', JSON.parse(JSON.stringify(data)));
    }

    function checkForModalAvailability(selectedItem) {
       const NOW_LLM_SERVICE_PROVIDER_ID = '56151629ff3566100158ffffffffff12'
        api.setState('selectedGroup', selectedItem)
        const isNowLLM = (selectedItem?.currentProvider?.id === NOW_LLM_SERVICE_PROVIDER_ID);
        if (isNowLLM || selectedItem?.azureConsentPassed || api.state.routing == 'global') {
            api.setState('disableSaveAndActive', false);
        } else {
            api.setState('disableSaveAndActive', true);

            if (selectedItem?.capabilityList?.length > 0 &&  selectedItem?.currentProvider?.id) {
            api.data.is_model_available_for_capabilities.execute({
                capabilityList: selectedItem?.capabilityList,
                providerSysId: selectedItem?.currentProvider?.id
            });
            }

        }
    }

    async function processProviderUpdate(output) {
        var failedSkills = [];
        var updatedSkills = [];
        const failedSkillsByGroup = {};
        let successfullyUpdatedGroupCount = 0;
        let isError = false;
        let isSkillGroupWithoutSkills = true
        let failedSkillGroup = [];
        let partiallyUpdatedSkillGroups = [];
        let successFullyUpdatedSkillGroups = [];
        if (!output.length) {
            showErrorBanner();
            return;
        }
        for (const record of output) {
            const { response, selectionType, groupName, selectedProvider, source } = record;
            const status = response?.status;
            // Handle Partial/Partial Success
            if (source === 'ai-agents' && response?.aiAgentResponse) {
                processAIAgentData(response.aiAgentResponse);
            }
            if (status === "Partial" || status === "Partial Success" || status === "Error") {
                if (selectionType === 'oobSkillGroup') {
                    if (status === "Error") {
                        failedSkillGroup.push(groupName)
                    } else if (status === "Partial Success") {
                        partiallyUpdatedSkillGroups.push(groupName);
                    }
                }

                var failedSkillGroupSkills = [];

                for (const key in response?.details) {
                    const updateStatus = response.details[key];
                    const capabilityId = key.split(':')[0];

                    const skills = api.state?.skillCapabilityMapping[capabilityId] || [];

                    if (updateStatus.status === "Error") {
                        const errorCode = response.details[`${capabilityId}:${selectedProvider}`]?.code;
                        const errorMessage = api.state.errorMessages?.[errorCode];
                        if (skills.length > 0) {
                            for (const skill of skills) {
                                skill.error = errorMessage;
                                if (selectionType !== 'oobSkill') {
                                    skill.showIntruptionModalGroupSkillList = false;
                                }

                                if (selectionType === 'oobSkill' || selectionType === 'instanceLevel') {
                                    failedSkills.push(skill);
                                } else {
                                    failedSkillGroupSkills.push(skill)

                                }
                            }
                        }

                    }

                    if (updateStatus.status === "Success") {
                        if (skills?.length > 0) {
                            updatedSkills.push(...skills);
                        }

                    }
                }
                if (selectionType === 'oobSkillGroup' && failedSkillGroupSkills.length > 0) {
                    failedSkillGroupSkills = Object.values(
                        failedSkillGroupSkills.reduce((acc, item) => {
                            if (!acc[item.id]) {
                                acc[item.id] = item;
                            }
                            return acc;
                        }, {})
                    );

                    failedSkillsByGroup[groupName] = failedSkillGroupSkills;
                }
            }

            else if (status === "Success") {
                if (selectionType === "oobSkill" || selectionType === "instanceLevel") {
                    for (const key in response?.details) {
                        const capabilityId = key.split(':')[0];
                        const skills = api.state?.skillCapabilityMapping[capabilityId] || [];
                        updatedSkills.push(...skills || []);
                    }
                } else if (selectionType === "oobSkillGroup") {
                    successFullyUpdatedSkillGroups.push(groupName)
                }
            }
        }
        updatedSkills = Object.values(
            updatedSkills.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = item;
                }
                return acc;
            }, {})
        );
        failedSkills = Object.values(
            failedSkills.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = item;
                }
                return acc;
            }, {})
        );


        // Convert to Set if array is not empty; otherwise, use empty Set
        const failedIds = failedSkillGroupSkills?.length > 0
            ? new Set(failedSkillGroupSkills.map(skill => skill.id))
            : new Set();


        const failedSkillIds = failedSkills?.length > 0
            ? new Set(failedSkills.map(skill => skill.id))
            : new Set();

        // Filter updatedSkills to remove failed group skills
        let filteredUpdatedSkills = failedIds.size > 0
            ? updatedSkills.filter(skill => !failedIds.has(skill.id))
            : updatedSkills;

        // Further filter by failed individual skills
        filteredUpdatedSkills = failedSkillIds.size > 0
            ? filteredUpdatedSkills.filter(skill => !failedSkillIds.has(skill.id))
            : filteredUpdatedSkills;



        let filteredFailedSkills = failedIds.size > 0
            ? failedSkills.filter(skill => !failedIds.has(skill.id))
            : failedSkills;


        // Set state with corrected key names
        api.setState('modalUpdateSkillStatus', {
            failedSkills: filteredFailedSkills,
            failedGroupsAndSkills: failedSkillsByGroup,
            updatedSkills: filteredUpdatedSkills
        });


        // Determine next step: modal, error banner, or redirect
        if (failedSkillsByGroup && Object.values(failedSkillsByGroup).length > 0) {
            isSkillGroupWithoutSkills = Object.values(failedSkillsByGroup).some(val => Array.isArray(val) && val.length === 0);
        }
        if (failedSkills.length > 0 || !isSkillGroupWithoutSkills || updatedSkills.length > 0 || api.state?.successFullyDisabledAgentAndWorkflows?.length > 0) {
            helpers.modal.open("[component-id$='interruption_modal']");
        } else if (failedSkillGroup.length > 0 || partiallyUpdatedSkillGroups.length > 0 || successFullyUpdatedSkillGroups.length > 0) {
            showBannerForPartialUpdate(failedSkillGroup, partiallyUpdatedSkillGroups, successFullyUpdatedSkillGroups);
        }
        else {
            const oobSkillCount = api.state.skillList.length;
            redirectToLLmProviderTab(oobSkillCount, successfullyUpdatedGroupCount);
        }
    }

    async function showBannerForPartialUpdate(failedSkillGroups, partiallyUpdatedSkillGroups, successFullyUpdatedSkillGroups) {
        let translatedTextPart1 = "";
        let translatedTextPart2 = "";
        let translatedTextPart3 = "";

        // Failed updates
        if (failedSkillGroups.length > 0) {
            const failedLabels = failedSkillGroups.map(String).join(", ");
            translatedTextPart1 = await helpers.translate(
                "Provider update failed for {0}.",
                failedLabels
            );
        }

        // Partial updates
        if (partiallyUpdatedSkillGroups.length > 0) {
            const partialLabels = partiallyUpdatedSkillGroups.map(String).join(", ");
            translatedTextPart2 = await helpers.translate(
                "Some of the skills updated, while others failed for {0}.",
                partialLabels
            );
        }

        // Successful updates
        if (successFullyUpdatedSkillGroups.length > 0) {
            const successLabels = successFullyUpdatedSkillGroups.map(String).join(", ");
            translatedTextPart3 = await helpers.translate(
                "Provider updated successfully for {0}.",
                successLabels
            );
        }

        // Join all parts with proper spacing
        const notificationText = [translatedTextPart1, translatedTextPart2, translatedTextPart3]
            .filter(Boolean)
            .join(" ");


        if (notificationText) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "manage_llm_partial_success_alert",
                    status: "info",
                    icon: "exclamation-triangle-outline",
                    content: {
                        type: "html",
                        value: notificationText
                    },
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        }
    }





    async function showErrorBanner(failedSkillGroupCount = 0) {
        const message = failedSkillGroupCount > 0
            ? "Provider update failed for {0} skill group"
            : "Provider update failed.";

        const translatedText = await helpers.translate(message, failedSkillGroupCount);

        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "manage_llm_error_alert",
                status: "critical",
                icon: "exclamation-triangle-outline",
                content: {
                    type: "html",
                    value: translatedText
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });

    }


    function addSelectedGroupToRepeater(groupData) {
        var selectedItems = api?.state?.customSelectedItems || [];
        //check to avoid duplicate data to repeater
        const isAlreadySelected = selectedItems.some(item => item.id === groupData?.sys_id);
        if (!isAlreadySelected) {
            selectedItems.push({
                task: Date.now(),
                id: groupData?.sys_id,
                label: groupData?.name,
                sublabel: (groupData?.description || "").replace(/<\/?[^>]+(>|$)/g, ""),
                providers: groupData?.providers,
                selectedProvider: groupData?.selected_provider,
                currentProvider: { id: groupData?.selected_provider },
                capabilityList: groupData?.capability_list,
                skillList: groupData?.capabilitySkills,
                azureConsentPassed: groupData?.global_consent,
                selectionType: "oobSkillGroup",
                source: groupData?.source,
                sys_id: groupData?.sys_id
            });
        }


        if (groupData?.source == 'ai-agents') {
            var providerId = groupData.selected_provider;
            api.data.fetch_skills_based_on_providers_1.execute({
                type: 'FETCH_AGENT_LIST',
                payload: {
                    providerId
                }
            });
        }
        api.setState('disableSaveAndActive', false);
        _formatSkillData(groupData?.capabilitySkills, groupData?.selected_provider)
        api.setState('customSelectedItems', JSON.parse(JSON.stringify(selectedItems)));
    }
    function addSkillFromPageParams(skillData, skillCapabilityMapping) {
        const selectedItems = api?.state?.customSelectedItems || [];
        const newItem = {
            task: Date.now(),
            selectionType: 'oobSkill',
            skillList: [skillData]
        };
        selectedItems.push(newItem);
        const currentItem = selectedItems[0];
        const updatedSkillMappings = { ...skillCapabilityMapping };
        const capabilityId = skillData.capabilityId;
        const relatedSkills = skillCapabilityMapping[capabilityId] || [];
        delete updatedSkillMappings[capabilityId];
        const uniqueSkills = Array.from(
            new Map(relatedSkills.map(skill => [skill.id, skill])).values()
        );
        currentItem.skillList = uniqueSkills;
        currentItem.capabilityList = [capabilityId];
        currentItem.selectedValues = uniqueSkills;
        currentItem.label = skillData.label;
        currentItem.capabilityId = capabilityId;
        const dependentSkills = relatedSkills.filter(skill => skill.id !== skillData.id);
        if (dependentSkills.length > 0) {
            helpers.modal.open("dependent_skill_modal");
            api.setState("interdependent_skills", {
                dependentSkills,
                currentSkill: skillData
            });
        }
        api.setState('disableSaveAndActive', false);
        api.setState('updatedSkillCapabilityMapping', updatedSkillMappings);
        api.setState('filteredSkillList', skillList);
        api.setState('customSelectedItems', JSON.parse(JSON.stringify(selectedItems)));
    }


    async function redirectToLLmProviderTab(oobSkillCount, oobGroupCount) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "aict_not_installed_alert",
                status: "positive",
                icon: "circle-check-outline",
                header: await helpers.translate('Model providers successfully updated'),
                content: {
                    type: "html",
                    value: oobSkillCount > 0 ? await helpers.translate("Updated LLM Provider for {0} Skills", oobSkillCount) : await helpers.translate("Updated LLM Provider for all skills and skill groups")
                },
                action: {
                    type: 'dismiss'
                }

            }]
        });

        helpers.timing.setTimeout(() => {
            api.emit("NAV_ITEM_SELECTED", {
                route: 'manage-llm-providers',
                params: {
                    'selectedTab': 1
                },
                reload: true
            });
        }, 2000);

    }

    function checkForAgentGroup(repeaterItems) {
        var isAiAgent = repeaterItems.find(item => item.source == 'ai-agents');
        return isAiAgent ? true : false;
    }

    function _formatSkillData(skillList, selectedProvider) {

        const rows = [];

        skillList = Object.values(
            skillList.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = item;
                }
                return acc;
            }, {})
        );
        var filteredSkillList = skillList.filter(item =>
            item.providerId !== selectedProvider
        );
        filteredSkillList.forEach(skill => {

            const skillId = skill?.id
            const providerName = skill?.default_provider || '';


            rows.push({
                key: `${skillId}_${Date.now()}`,
                cells: {
                    status: {

                        componentProps: {
                            "bare": true,
                            "hidePadding": false,
                            "size": "md",
                            "tooltipContent": getSkillToolTip(skill.skill_status),
                            "style": {
                                "background": _getStatusColor(skill.skill_status),
                                "height": "17px",
                                "width": "17px",
                                "border-radius": "17px",
                                "margin-left": "17px"
                            }
                        }
                    },
                    skillName: {
                        value: skill.label,
                        label: skill.label,
                        id: skill.label
                    },
                    currentProvider: {
                        value: providerName,
                        label: providerName,
                        id: providerName
                    },
                    product: {
                        value: skill.product_name,
                        label: skill.product_name,
                        id: skill.product_name
                    },

                    defaultLlmProvider: {
                        value: providerName,
                        label: providerName,
                        id: providerName
                    }
                }
            });
        });
        api.setState('filteredSkillListCount', rows?.length)
        api.setState('filteredSkillList', { rows })
        return { rows };



        function _getStatusColor(status) {
            const statusColors = {
                active: "rgb(var(--now-color_alert--positive-1))",
                inactive: "rgb(var(--now-color_alert--critical-3))",
                draft: "rgb(var(--now-color_alert--warning-3))"
            };
            return statusColors[status] || "rgb(var(--now-color--neutral-5))"
        }

        function getSkillToolTip(status) {
            const skillStatusLableMapping = {
                active: "Active",
                inactive: "Inactive",
                draft: "Draft",
                notconfigured: "Not started"
            };
            return skillStatusLableMapping[status] || status

        }



    }
    function isValidUserActions(repeaterItems) {
        for (const item of repeaterItems) {
            if (item.selectionType == 'oobSkillGroup' && (!item?.sys_id || !item?.selectedProvider)) {

                return true;
            } else if (item.selectionType == 'oobSkill' && (!item?.selectedProvider || item?.skillList?.length == 0)) {
                return true;
            }
        }
        return false;

    }
    function processAIAgentData(response) {
        const AGENT_DISABLE_API_SUCCESS_STATUS_CODE = 70000;
        const AGENT_DISABLE_API_FAILED_STATUS_CODE = 70001;

        const successFullyDisabledAgentAndWorkflows = response.data.filter(item => item.statusCode === AGENT_DISABLE_API_SUCCESS_STATUS_CODE);
        const failedDisabledAgentAndWorkflows = response.data.filter(item => item.statusCode === AGENT_DISABLE_API_FAILED_STATUS_CODE);
        api.setState('successFullyDisabledAgentAndWorkflows', successFullyDisabledAgentAndWorkflows);
        api.setState('failedDisabledAgentAndWorkflows', failedDisabledAgentAndWorkflows)


    }
    function addAllCapabilitySkills(allMatchingSkills, updatedSkillList, selectionType, selectedProvider, data) {
        allMatchingSkills.forEach(skill => {
            // Avoid duplicates
            if (!updatedSkillList.some(s => (s.capabilityId === skill.capabilityId && s.id === skill.id))) {
            skill.selectionType = selectionType;
            skill.selectedProvider = selectedProvider;
            updatedSkillList.push(skill);

            // Recursively find and add nested matching skills by ID
            for (const key in data) {
                const nestedSkills = data[key];
                nestedSkills.forEach(item => {
                    if (item.id === skill.id) {
                        delete data[key];
                        addAllCapabilitySkills(nestedSkills, updatedSkillList, selectionType, selectedProvider, data);
                    }
                });
            }
            }
        });
        return updatedSkillList;
    }
    

    }
