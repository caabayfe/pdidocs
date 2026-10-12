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
    if (!event)
        return;
    let header = null;
    let controlExternalTask = null;
    if (api.context.props && api.context.props.hidePolarisHeader == 'true') {
        header = 'true';
    }
    if (api.context.props && api.context.props.controlExternalTask == 'true') {
        controlExternalTask = 'true';
    }
    switch (event.name) {
        case 'NOW_DROPDOWN#ITEM_CLICKED':
            api.setState('categoryId', event.payload.item.id);
            api.setState('taskId', null);
            api.setState('markAsComplete', false);
            api.setState('isLocked', false);
            api.setState('detailTask', {});
            helpers.navigate.to(
                'tasks', {
                    "setupId": api.context.props.setupId
                }, {
                    'categoryId': event.payload.item.id,
                    'taskId': null,
                    'hidePolarisHeader': header,
                    'controlExternalTask': controlExternalTask
                }
            );
            api.data.fetch_tasks_1.refresh();
            break;

        case 'NOW_CONTENT_TREE#ITEM_CLICKED':
            api.setState('selectedTask', [
                [event.payload.item.id]
            ]);
            if (event.payload.item.id !== api.state.taskId) {
                api.setState('markAsComplete', event.payload.item.status === 'Completed');
                helpers.navigate.to('tasks', {
                    "setupId": api.context.props.setupId
                }, {
                    "categoryId": api.state.categoryId,
                    "taskId": event.payload.item.id,
                    "hidePolarisHeader": header,
                    "controlExternalTask": controlExternalTask
                });
                api.setState('tableSysId', '');
            }
            break;

        case 'SN_HELP_SETUP_FOOTER#TERTIARY_CHECKED_SET':
            api.setState('markAsComplete', event.payload.value);
            break;

        case 'NOW_BUTTON_ICONIC#CLICKED':
            const timestamp = new Date().getTime();
            helpers.navigate.to('setup', {
                "sysId": api.context.props.setupId
            }, {
                "customId": timestamp,
                "hidePolarisHeader": header,
                "controlExternalTask": controlExternalTask
            });
            break;

        case 'SN_HELP_SETUP_LIST#PLUGIN_CHECKED_SET':
            const installPlugins = [...api.state.installPlugins];
            if (event.payload.value) {
                installPlugins.push({
                    ...event.payload.plugin
                });
            } else {
                const selectedPluginIndex = installPlugins.findIndex(plugin => plugin.sys_id === event.payload.plugin.sys_id);
                installPlugins.splice(selectedPluginIndex, 1);
            }
            api.setState('installPlugins', installPlugins);
            break;

        case 'DATA_FETCH_SUCCEEDED':
            const installPluginsText = await helpers.translate('Install Plugins');
            if (event.elementId === 'fetch_tasks_1') {
                const taskList = api.data.fetch_tasks_1.output;
                if (taskList && taskList.result && !taskList.result.error) {
                    api.setState('showErrorMsg', false);
                    api.state.taskId || api.setState('taskId', taskList.result.tasks[0].sys_id);
                    api.state.taskId ? api.setState('selectedTask', [
                        [api.state.taskId]
                    ]) : api.setState('selectedTask', [
                        [taskList.result.tasks[0].sys_id]
                    ]);
                    if (taskList.result.tasks.findIndex(task => task.sys_id == api.context.props.taskId) == -1) {
                        // If invalid task id passed in url, select the first task
                        api.setState('selectedTask', [
                            [taskList.result.tasks[0].sys_id]
                        ]);
                        api.setState('taskId', taskList.result.tasks[0].sys_id);
                    } else {
                        if(api.state.taskId !== api.context.props.taskId) {
                            api.setState('taskId', api.context.props.taskId);
                        }
                    }
                    api.setState('taskList', taskList.result.tasks.map(task => {
                        return { ...task,
                            name: (task.parent == api.state.pluginCategoryId) ? installPluginsText : task.name
                        };
                    }));
                    let isTaskCompleted = false;
                    for (let i = 0; i < taskList.result.tasks.length; i++) {
                        if (taskList.result.tasks[i].sys_id === api.state.taskId) {
                            if (taskList.result.tasks[i].interactionStatus === 'Completed') {
                                isTaskCompleted = true;
                            }
                            break;
                        }
                    }
                    api.setState('isTaskCompleted', isTaskCompleted);
                    if (!api.context.props.taskId) {
                        api.setState('selectedTask', [
                            [taskList.result.tasks[0].sys_id]
                        ]);
                    }
                    return;
                }
                api.setState('showErrorMsg', true);
                return;
            }

            if (event.elementId === 'get_task_details_1') {
                const taskData = api.data.get_task_details_1.output;
                if (taskData && taskData.result && !taskData.result.error) {
                    let relatedContent = taskData.result.taskDetails.content.configuration_types === 'custom' && taskData.result.taskDetails.content.related_content;
                    relatedContent = relatedContent.length > 0 ? relatedContent.map(item => ({ ...item,
                        "icon": item.type === 'document' ? 'document-outline' : 'video-outline'
                    })) : [];
                    api.setState('taskName', (taskData.result.taskDetails.content.configuration_types === 'install_plugin') ? installPluginsText : taskData.result.taskDetails.name);
                    api.setState('taskDescription', taskData.result.taskDetails.rich_description);
                    api.setState('isMandatory', taskData.result.taskDetails.task_type === 'basic');
                    api.setState('markAsComplete', taskData.result.taskDetails.interactionStatus === 'Completed');
                    api.setState('showErrorMsg', false);
                    api.setState("detailTask", { ...taskData.result.taskDetails.content,
                        "related_content": relatedContent
                    });

                    const taskStatus = taskData.result.taskDetails.interactionStatus || 'Not Started';
                    const taskType = taskData.result.taskDetails.task_type;

                    if (taskData.result.taskDetails.content.configuration_types === "table") {
                        api.data.gform.reload();
                        api.setState("tableSysId", "-1");
                    }

                    if (taskData.result.taskDetails.content.configuration_types === 'install_plugin') {
                        const plugins = taskData.result.taskDetails.content.records;
                        const installPlugins = [];
                        plugins.forEach(async plugin => {
                            plugin.type = plugin.taskType;
                            if (plugin.active === 'active') {
                                plugin.status = await helpers.translate('Installed');
                                plugin.isInstalled = true;
                                plugin.statusColor = 'teal';
                                if ((taskType === 'basic' && plugin.taskType === 'basic') ||
                                    (taskType === 'recommended' && plugin.taskType === 'recommended')) {
                                    plugin.type = 'basic';
                                } else {
                                    plugin.type = plugin.taskType;
                                }
                            } else if (plugin.taskType === 'basic') { //Basic and Not Installed
                                plugin.type = 'basic';
                                installPlugins.push(plugin);
                            } else if (plugin.taskType === 'recommended' && taskType === 'recommended') {
                                plugin.type = 'basic';
                                installPlugins.push(plugin);
                            }
                        });
                        api.setState('plugins', [...plugins]);
                        api.setState('installPlugins', [...installPlugins]);
                        api.data.get_help_user_interaction_step_task_page.refresh();
                    }
                    api.setState("taskStatus", taskStatus);
                    api.setState("isLocked", taskData.result.taskDetails.isLocked);
                    const tasks = api.state.taskList;
                    let isTaskCompleted = false;
                    if (tasks && tasks.length > 0) {
                        for (let i = 0; i < tasks.length; i++) {
                            if (tasks[i].sys_id === api.state.taskId) {
                                if (tasks[i].interactionStatus === 'Completed') {
                                    isTaskCompleted = true;
                                }
                                break;
                            }
                        }
                    }
                    const {
                        dependencies
                    } = taskData.result.taskDetails;
                    api.setState('dependencies', dependencies && dependencies[0].dependent_on_steps);
                    api.setState('isTaskCompleted', isTaskCompleted);
                    return;
                }
                api.setState('showErrorMsg', true);
                return;
            }
            if (event.elementId === 'get_setup_1') {
                const setupData = api.data.get_setup_1.output;
                if (setupData && setupData.result && !setupData.result.error) {
                    if (setupData.result.setup.status != 'published') {
                        api.setState('emptyState', {
                            'show': true,
                            'message': await helpers.translate('The setup is currently unavailable, please contact your system administrator to publish the setup'),
                            'illustration': 'unconfigured'
                        });
                        return;
                    }
                    const groups = setupData.result.setup.steps;
                    api.setState('groups', groups);
                    for (let i = 0; i < groups.length; i++) {
                        //TODO: How to find plugins category
                        if (groups[i].name.toLowerCase() === 'plugins') {
                            api.setState('pluginCategoryId', groups[i].sys_id);
                            break;
                        }
                    }
                    if (groups.findIndex(group => group.sys_id == api.context.props.categoryId) == -1) {
                        // If invalid category id passed in url, select the first category
                        api.setState('categoryId', groups[0].sys_id);
                    }
                    return;
                }
                api.setState('emptyState', {
                    'show': true,
                    'message': await helpers.translate('No setup found!'),
                    'illustration': 'no-data'
                });
                api.setState('showErrorMsg', true);
                return;
            }
            if (event.elementId === 'get_help_user_interaction') {

                let helpUserInteraction = api.data.get_help_user_interaction.results;

                if (api.context.props.hidePolarisHeader == 'true') {
                    // When in embed mode 
                    // 1. Create User interaction record if it doesn't exist.
                    // 2. Give priority to User Interaction record even when setup type is passed as optional parameter. Update only if the optional parameter has greater setup type than User interaction record

                    let setupType = api.context.props.setupType;

                    let prevSelectedSetupType = helpUserInteraction.length != 0 && helpUserInteraction[0].active_setup_type.value;

                    let setupTypeMap = {
                        'basic': 'quick',
                        'recommended': 'best_exp',
                        'advanced': 'custom'
                    };

                    let setupTypeMapRev = {
                        'quick': 'basic',
                        'best_exp': 'recommended',
                        'custom': 'advanced'
                    };

                    const getIndexOfSetupType = (type, map) => Object.keys(map).indexOf(type);

                    if (prevSelectedSetupType && getIndexOfSetupType(prevSelectedSetupType, setupTypeMapRev) >= getIndexOfSetupType(setupType, setupTypeMap)) {
                        // Persist the setup type if the user has already selected greater setup type earlier
                        api.setState('taskType', setupTypeMapRev[prevSelectedSetupType]);
                    } else if (['basic', 'recommended', 'advanced'].includes(setupType)) {
                        api.setState('taskType', setupType);
                    } else {
                        api.setState('taskType', 'advanced');
                    }

                    // Make a call to interaction api if
                    // 1. Interaction doesn't exist.
                    // 2. If previous selected setup type is less than the setup type passed in the url.
                    if (
                        !prevSelectedSetupType || (getIndexOfSetupType(prevSelectedSetupType, setupTypeMapRev) < getIndexOfSetupType(setupType, setupTypeMap))
                    ) {
                        const {
                            snHttp
                        } = helpers;

                        snHttp(`api/sn_ads_setup/play/interaction/setup/${api.context.props.setupId}`, {
                                method: 'POST',
                                batch: false,
                                body: {
                                    "active_setup_type": ['basic', 'recommended', 'advanced'].includes(setupType) ? setupTypeMap[setupType] : 'custom'
                                }
                            })
                            .catch(({
                                error
                            }) => {
                                console.log(error);
                            });
                    }

                    return;
                }

                if (!helpUserInteraction || helpUserInteraction.length == 0) {
                    api.setState('showErrorMsg', true);
                    return;
                }
                let taskType = helpUserInteraction[0].active_setup_type.value;
                switch (taskType) {
                    case 'quick':
                        taskType = 'basic';
                        break;
                    case 'best_exp':
                        taskType = 'recommended';
                        break;
                    case 'custom':
                        taskType = 'advanced';
                        break;
                };
                api.setState('taskType', taskType);
                return;
            }
    }
}
