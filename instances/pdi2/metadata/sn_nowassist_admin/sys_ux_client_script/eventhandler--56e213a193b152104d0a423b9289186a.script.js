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

    function resetAddSkillModalData(){
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: false,
            action: null,
            nonBlocking: false
        });
        api.setState('skillName', '');
        api.setState('selectedWorkflow', {id: ""});
        api.setState('selectedProduct', {id: ""});     
    }

    function resetMigrationModalData(){
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: false,
            action: null,
            nonBlocking: false
        });
        api.setState('newConfigName', '');
        api.setState('migrateSkillConfigId', '');
        api.setState('isMigrateConfigClicked', false);     
    }

    function resetConfigurationTab() {
        let configurationTabData = api.state.configurationTabConfig;
        configurationTabData.isLoading = true;
        configurationTabData.pageNumber = 0;
        configurationTabData.limit = 5;
        configurationTabData.offset = 0;
        configurationTabData.isFetchAPICalled = true;
        api.setState('configurationTabConfig', { ...configurationTabData });
    }
    switch (event.elementId) {
        case "configuration_tab_pagination":
        case "available_tab_pagination":
        case "active_tab_pagination":
            let tabKey = '';
            if (event.elementId === 'configuration_tab_pagination') {
                tabKey = 'configurationTab';
            } else if (event.elementId === 'available_tab_pagination') {
                tabKey = 'availableTab';
            } else if (event.elementId === 'active_tab_pagination') {
                tabKey = 'activeTab';
            }
            var pageNumber = event.payload.value;
            var totalCount = api.state[tabKey + 'Count'];
            const keyForConfig = tabKey + 'Config';
            var startRow = Math.min(totalCount, pageNumber * 5);
            var endRow = Math.min(startRow + 5, totalCount);
            const tabConfig = api.state[keyForConfig];
            tabConfig.offset = startRow;
            tabConfig.limit = endRow;
            tabConfig.pageNumber = pageNumber;
            tabConfig.isLoading = true;
            tabConfig.isFetchAPICalled = true;
            api.setState(keyForConfig, { ...tabConfig });
            break;
        case "clone_skill":
            let cloneSkillOutput = api.data.clone_skill.output;
            let shouldRedirect = true;
            let skillConfigId;
            let shouldResetData = false;
            if (event.name === "DATA_FETCH_FAILED" || (cloneSkillOutput && !cloneSkillOutput.success && cloneSkillOutput.message)) {
                shouldResetData = true;
                let errorMessage = event.payload?.errors?.length ? event.payload.errors[0] : cloneSkillOutput.message;
                if (errorMessage) {
                    errorMessage = errorMessage.replace(/^Error:\s*/, '').split('(')[0].trim();
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: 'skill-cloned-error',
                            status: cloneSkillOutput.isWarning ? 'warning' : 'critical',
                            icon: 'circle-exclamation-outline',
                            content: {
                                type: "html",
                                value: await helpers.translate(errorMessage)
                            },
                            action: {
                                type: "dismiss"
                            },
                        }]
                    });
                }
                if (!cloneSkillOutput.isWarning) {
                    shouldRedirect = false;
                }
                skillConfigId = cloneSkillOutput.skillConfigId;
            } else if (cloneSkillOutput?.success) {
                shouldResetData = true;
                skillConfigId = cloneSkillOutput.skillConfigId;
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: 'skill-cloned',
                        status: 'positive',
                        icon: 'check-circle-outline',
                        content: {
                            type: "html",
                            value: await helpers.translate('Configuration created successfully')
                        },
                        action: {
                            type: "dismiss"
                        },
                    }]
                });
            }

            if(shouldResetData){
                resetConfigurationTab();
                resetAddSkillModalData();
            }

            if (shouldRedirect && skillConfigId) {
                api.emit('NAV_ITEM_SELECTED', {
                    external: {
                        url: `now/now-assist-admin/skill-guided-setup/${skillConfigId}`,
                        target: '_blank'
                    }
                });
            }
            
            break;
        case "fetch_na_workflow_and_product_list":
            let workflowOutput = api.data.fetch_na_workflow_and_product_list.output || [];
            api.setState('workflowList', workflowOutput);
            break;
        case "workflow_list":
            const selectedWorkflow = api.state.selectedWorkflow;
            api.setState('productListOnWorkflow', JSON.parse(JSON.stringify(selectedWorkflow.products || [])));
            break;
        case "migrate_config_submit":
            api.setState('isMigrateConfigClicked', true);
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: true,
                action: null,
                nonBlocking: false
            });
            break;
        case "migrate_existing_nacm_config":
            let migrateConfigOutput = api.data.migrate_existing_nacm_config.output;
            let shouldResetMigrateModal = false;
            if (event.name === "DATA_FETCH_FAILED" || (migrateConfigOutput && !migrateConfigOutput.success && migrateConfigOutput.message)) {
                shouldResetMigrateModal = true;
                let errorMessage = event.payload?.errors?.length ? event.payload.errors[0] : migrateConfigOutput.message;
                if (errorMessage) {
                    errorMessage = errorMessage.replace(/^Error:\s*/, '').split('(')[0].trim();
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: 'migrate-config-error',
                            status: 'critical',
                            icon: 'circle-exclamation-outline',
                            content: {
                                type: "html",
                                value: await helpers.translate(errorMessage)
                            },
                            action: {
                                type: "dismiss"
                            }
                        }]
                    });
                }
            } else if (migrateConfigOutput?.success) {
                shouldResetMigrateModal = true;
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: 'migrate-config-success',
                        status: 'positive',
                        icon: 'check-circle-outline',
                        content: {
                            type: "html",
                            value: await helpers.translate('Configuration successfully Migrated')
                        },
                        action: {
                            type: "dismiss"
                        }
                    }]
                });

                if (migrateConfigOutput.newConfigIds?.length) {
                    migrateConfigOutput.newConfigIds.forEach((configId) => {
                        api.emit('NAV_ITEM_SELECTED', {
                            external: {
                                url: `now/now-assist-admin/skill-guided-setup/${configId}`,
                                target: '_blank'
                            }
                        });
                    });
                } else if (migrateConfigOutput.newConfigId) {
                    api.emit('NAV_ITEM_SELECTED', {
                        external: {
                            url: `now/now-assist-admin/skill-guided-setup/${migrateConfigOutput.newConfigId}`,
                            target: '_blank'
                        }
                    });
                    resetConfigurationTab();
                }
            }
            if(shouldResetMigrateModal){
                resetMigrationModalData();
            }
            break;
        case 'deactivate_config':
            const deactivatConfigOutput = api.data.deactivate_config.output;
            const isSuccess = deactivatConfigOutput?.success;

            if (isSuccess) {
                const keyConfig = api.state.deactivateClickedTab;
                if (keyConfig) {
                    const tabConfig = api.state[keyConfig];
                    tabConfig.isFetchAPICalled = true;
                    tabConfig.isLoading = true;
                    api.setState(keyConfig, tabConfig);
                    const dataBroker = keyConfig == 'configurationTabConfig' ? 'write_with_now_assist_application_usage' : 'fetch_available_skills';
                    api.data[dataBroker].refresh();
                }
            }
            break;
    }
}
