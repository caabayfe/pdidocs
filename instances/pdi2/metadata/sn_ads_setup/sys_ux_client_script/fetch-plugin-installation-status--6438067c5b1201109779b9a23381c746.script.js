/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    function completeTask(api, helpers, action) {
        const taskData = api.data.get_task_details_1.output;
        const taskStatus = taskData.result.taskDetails.interactionStatus || 'Not Started';
        const taskType = taskData.result.taskDetails.task_type;
        if(taskData.result.taskDetails.content.configuration_types !== 'install_plugin') {
            return;
        }
        
        if(taskStatus !== 'Completed') {
            /*
                1) Task Type - Basic
                    If all mandatory plugins are installed, complete the task
                2) Task Type - Recommended
                    If all mandatory plugins and recommended plugins are installed, complete the task
                3) Task Type - Advanced
                    The plugin task is not a blocker and the setup can be completed without installing a single plugin.
                    So only check for basic plugins installation status
            */
            let canCompleteTask = true;
            let plugins = api.state.plugins;
            
            for(let i=0; i<plugins.length; i++) {
                if(['basic', 'recommended'].indexOf(taskType) >= 0) {
                    if(plugins[i].active !== 'active') {
                        canCompleteTask = false;
                        break;
                    }
                } else if(taskType === 'advanced') {
                    if(plugins[i].type === 'basic' && plugins[i].active !== 'active') {
                        canCompleteTask = false;
                        break;
                    }
                }
            }

            if(canCompleteTask) {
                const { snHttp } = helpers;
                snHttp(`api/sn_ads_setup/play/log/setup/${api.context.props.setupId}/step/${taskData.result.taskDetails.sys_id}`, {
                    method: 'POST',
                    batch: false,
                    body: {
                        action: action || 'completed'
                    }
                })
                .then(_ => api.data.fetch_tasks_1.refresh());
            }
        }
    }
    
    let result = api.data.get_help_user_interaction_step_task_page.output.data.GlideRecord_Query.help_user_interaction_step._results[0];
    if(
        !result || 
        api.state.plugins.length === 0 ||
        result.step.value !== api.state.taskId
    ) {
        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            loading: false,
            nonBlocking: false
        });
        return;
    }

    if(result.options.value === null) { //Didn't find any meta on plugins
        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            loading: false,
            nonBlocking: false
        });
        completeTask(api, helpers, 'completed');
        return;
    }

    let options = JSON.parse(result.options.value);    
    let userInput;
    try {
        if(options.user_input) {
            userInput = JSON.parse(options.user_input);
        }
    } catch(e) {
        console.log('Failed to read plugin status' + e);
        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            loading: false,
            nonBlocking: false
        });
        return;
    }

    const {
        snHttp
    } = helpers;
    if(userInput.status === '0') { //Pending
        //Won't work in local because of CORS issue
        //Console url and open tab with that id
        //Example: http://192.168.1.5:8082/... instead of http://localhost:8082/...
        snHttp(userInput.links.results.url, {
            method: 'GET',
            batch: false
        })
        .then(async ({
            response
        }) => {
            let userSelectedPlugins = response.result.batch_items;
            let taskPlugins = JSON.parse(JSON.stringify(api.state.plugins));

            const installingStatusLabel = await helpers.translate('Installing');
            const installedStatusLabel = await helpers.translate('Installed');
            let failedPluginsCount = 0;
            for(let i=0; i<userSelectedPlugins.length; i++) {
                for(let j=0; j<taskPlugins.length; j++) {
                    if(taskPlugins[j].id === userSelectedPlugins[i].item_id) {
                        if(['In progress', 'Ready'].indexOf(userSelectedPlugins[i].state) >= 0) {
                            taskPlugins[j].status = installingStatusLabel;
                            taskPlugins[j].statusColor = 'yellow';
                            taskPlugins[j].isInstalled = true;
                        } else if(userSelectedPlugins[i].state === 'Installed') {
                            taskPlugins[j].status = installedStatusLabel;
                            taskPlugins[j].statusColor = 'teal';
                            taskPlugins[j].isInstalled = true;
                        }
                        break;
                    }
                }

                if(userSelectedPlugins[i].state !== 'Installed') {
                    failedPluginsCount++;
                }
            }
            api.setState('plugins', taskPlugins);
            
            if(response.result.batch_plan.state === 'In progress') {
                helpers.timing.setTimeout(() => {
                    api.data.get_help_user_interaction_step_task_page.refresh();
                }, 30000);
                api.setState('disablePA', true);
                api.setState('installPlugins', []);
            } else if(response.result.batch_plan.state === 'Installed') {
                api.setState('disablePA', false);
                completeTask(api, helpers, failedPluginsCount === 0 ? 'completed' : 'retake',);
            }
            
            api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                loading: false,
                nonBlocking: false
            });
        })
        .catch(({
            error
        }) => {
            api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                loading: false,
                nonBlocking: false
            });
        });
    } else {
        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            loading: false,
            nonBlocking: false
        });
    }
}
