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
    const {
        associatedRecord: stepId
    } = api.context.props;

    const {
        snHttp
    } = helpers;

    function setInActivePluginsCount(plugins) {
        const inActivePluginsCount = plugins.filter(p => p.active == 'inactive');
        api.setState('inActivePluginsCount', inActivePluginsCount);

        if (!inActivePluginsCount.length) {
            api.emit('PLAYBOOK#COMPLETE_ACTIVITY_CONTEXT', {
                'contextId': api.state.contextId
            });
        }
    }

    function checkCICDStatus(cicdResponse, plugins = []) {
        if (cicdResponse.status === '0') {
            api.emit("PLAYBOOK_INTERNAL#SET_ACTIVITY_LOADING", {
                loading: true,
                contextId: api.state.contextId
            });
            snHttp('/api/sn_cicd/app/batch/results/' + cicdResponse.links.results.id, {
                    method: 'GET',
                    batch: false
                })
                .then(async ({
                    response
                }) => {
                    let userSelectedPlugins = response.result.batch_items;
                    let taskPlugins = plugins.length ? plugins : api.state.plugins;
                    const installingStatusLabel = await helpers.translate('Installing');
                    const installedStatusLabel = await helpers.translate('Installed');
                    let failedPluginsCount = 0;
                    for (let i = 0; i < userSelectedPlugins.length; i++) {
                        for (let j = 0; j < taskPlugins.length; j++) {
                            if (taskPlugins[j].id === userSelectedPlugins[i].item_id) {
                                if (['In progress', 'Ready'].indexOf(userSelectedPlugins[i].state) >= 0) {
                                    taskPlugins[j].status = installingStatusLabel;
                                    taskPlugins[j].statusColor = 'yellow';
                                    taskPlugins[j].isInstalled = false;
                                    taskPlugins[j].active = 'inactive';
                                } else if (userSelectedPlugins[i].state === 'Installed') {
                                    taskPlugins[j].status = installedStatusLabel;
                                    taskPlugins[j].statusColor = 'teal';
                                    taskPlugins[j].isInstalled = true;
                                    taskPlugins[j].active = 'active';
                                }
                                break;
                            }
                        }

                        if (userSelectedPlugins[i].state !== 'Installed') {
                            failedPluginsCount++;
                        }
                    }
                    api.setState('plugins', [...taskPlugins]);
                    setInActivePluginsCount(taskPlugins);
                    if (['In progress', 'Ready'].indexOf(response.result.batch_plan.state) >= 0) {
                        helpers.timing.setTimeout(() => {
                            checkCICDStatus(cicdResponse, taskPlugins);
                        }, 30000);
                        api.setState('installPlugins', []);
                    } else if (response.result.batch_plan.state === 'Installed') {
                        api.emit('PLAYBOOK#COMPLETE_ACTIVITY_CONTEXT', {
                            'contextId': api.state.contextId
                        });
                    }

                    api.emit("PLAYBOOK_INTERNAL#SET_ACTIVITY_LOADING", {
                        loading: false,
                        contextId: api.state.contextId
                    });
                })
                .catch(({
                    error
                }) => {
                    api.emit("PLAYBOOK_INTERNAL#SET_ACTIVITY_LOADING", {
                        loading: false,
                        contextId: api.state.contextId
                    });
                });
        }
    }

    function isActivityInProgress() {
        return api.data.playbook_activity_ui.playbookCardProperties.activityState.value === 'IN_PROGRESS';
    }

    switch (event.elementId) {
        case 'get_user_interaction_step':
            {
                let cicdResponse = api.data.get_user_interaction_step.result.step_input.value;
                if (cicdResponse && isActivityInProgress()) {
                    cicdResponse = JSON.parse(cicdResponse);
                    api.setState('cicdResponse', cicdResponse);
                    if (api.state.plugins.length) {
                        checkCICDStatus(cicdResponse);
                    }
                }
                !api.state.plugins.length && api.data.get_plugins_1.refresh();
                break;
            }
        case 'get_plugins_1':
            {
                let pluginRes = api.data.get_plugins_1.output;
                pluginRes = pluginRes.result;
                const installPlugins = [];
                const plugins = [];
                for (let p = 0; p < pluginRes.length; p++) {
                    const plugin = pluginRes[p];
                    const {
                        id,
                        name,
                        description,
                        active,
                        sys_id
                    } = plugin;
                    const obj = {
                        id,
                        name,
                        description,
                        active,
                        sys_id,
                        isInstalled: active === 'active'
                    };
                    if (obj.active === 'active') {
                        obj.status = await helpers.translate('Installed');
                        obj.statusColor = 'teal';
                    } else {
                        installPlugins.push(obj);
                    }
                    plugins.push(obj);
                }
                api.setState('plugins', [...plugins]);
                api.setState('installPlugins', [...installPlugins]);
                setInActivePluginsCount(plugins);
                if (api.state.cicdResponse && isActivityInProgress() && plugins.length) {
                    checkCICDStatus(api.state.cicdResponse, plugins);
                }
                break;
            }
    }
}
