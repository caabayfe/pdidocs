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
    const {
        snHttp
    } = helpers;
    const isNewTask = api.context.props.taskId === "-1";

    const disableContinue = (task) => {
        let disabledSteps = {
            step1: true,
            step2: true
        };
        if (task.name && (task.rich_description || task.description)) {
            disabledSteps.step1 = false;
            if (Object.keys(task.content).length != 0) {
                switch (task.content.configuration_types) {
                    case 'table':
                        if (task.content.table_name && task.content.view) {
                            disabledSteps.step2 = false;
                        }
                        break;
                    case 'iframe':
                        if (task.content.url) {
                            disabledSteps.step2 = false;
                        }
                        break;
                    case 'custom':
                        if (task.content.related_content) {
                            disabledSteps.step2 = false;
                        }
                        break;
                }
            }
        }
        api.setState('disabledSteps', disabledSteps);
        return;
    };

    const {step1 , step2, step3} = api.state.pageInput;
    let body = {
        name: step1.name,
        rich_description: step1.description,
        type: 'activity',
        sys_id: api.context.props.taskId,
        parent: api.context.props.categoryId,
        allow_delegation: step3.allow_delegation,
        task_type: step3.task_type,
        content: {
            sys_id: step1.contentId,
            configuration_types: step1.configuration_types,
            table_name: step2.tableName.id,
            view: step2.tableView.id,
            url: step2.url,
            related_content: step2.related_content.map(content => {
                return { ...content,
                    type: content.type == 'article' ? 'document' : content.type,
                    text: content.description
                };
            })
        }
    };

    if (step1.configuration_types === 'install_plugin') {
            body.content.table_name = 'v_plugin';
            body.content.records = api.state.plugins.map(plugin => plugin.sys_id).join();
    }

    if (api.state.taskStepStatus == api.state.selectedTaskStep)
        body.status = ((Number(api.state.taskStepStatus) + 1) % 4).toString(10);
        
    if ((api.state.taskStepStatus == 3 || api.state.taskStepStatus == 0) &&
        api.state.selectedTaskStep == 1 &&
        api.state.pageInput.step1.configuration_types != (api.data.get_setup_step.output.result.content.configuration_types || 'table')) {
        // If user changes the configuration type    
        body.status = 2;    
    }
    if (api.state.selectedTaskStep < 3) {
        api.setState('syncStepStatus', false);
        snHttp(`api/sn_ads_setup/build/setup/${api.context.props.setupId}/step/${api.context.props.taskId}`, {
                method: isNewTask ? 'POST' : 'PUT',
                batch: false,
                body: body
            })
            .then(({
                response
            }) => {
                if (isNewTask) {
                    helpers.navigate.setRouteParams({
                        'params': {
                            'taskId': response.result.sys_id
                        },
                        'redirect': false
                    });
                    api.setState('isNewTaskAdded', true);
                }
                const newPageInput = {...api.state.pageInput};
                let {configuration_types, table_name, view, url, related_content} = response.result.content;
                if (configuration_types == 'table') {
                    newPageInput.step2.tableName.id = table_name;
                    newPageInput.step2.tableView.id = view; 
                } else if (configuration_types == 'iframe') {
                    newPageInput.step2.url = url;
                } else if (configuration_types == 'custom') {
                    newPageInput.step2.related_content = related_content ? related_content.map(content => {
                        return {
                            ...content,
                            description: content.text
                        };  
                    }) : '';
                }
                api.setState('pageInput', newPageInput);
                api.setState('selectedTaskStep', api.state.selectedTaskStep + 1);
                disableContinue(response.result);
                api.data.get_all_tasks.refresh();
                api.data.get_setup_step.refresh();
            })
            .catch(({
                error
            }) => {
                //TODO: Open notification
                console.log(error);
            });
    } else {
        api.setState('syncStepStatus', true);
        snHttp(`api/sn_ads_setup/build/setup/${api.context.props.setupId}/step/${api.context.props.taskId}`, {
                method: 'PUT',
                batch: false,
                body: body
            })
            .then(({
                response
            }) => {
                const newPageInput = {...api.state.pageInput};
                newPageInput.step3 = {
                    allow_delegation: response.result.allow_delegation,
                    task_type: response.result.task_type
                }; 
                api.setState('pageInput', newPageInput);
                api.data.get_all_tasks.refresh();
            })
            .catch(({
                error
            }) => {
                //TODO: Open notification
                console.log(error);
            });
        let allTasks = api.data.get_all_tasks.results;
        let taskIndex = allTasks.findIndex(task => task.sys_id.value === api.state.currentTaskId[0][0]);
        if (allTasks.length - 1 === taskIndex || api.state.isPluginStoreCategory) {
            // If current task is last task of the category - Navigate to next category
            const categories = api.data.get_all_categories.results;
            if (categories) {
                const categoryIndex = categories.findIndex(category => category.sys_id.value === api.context.props.categoryId);
                if (categories.length - 1 === categoryIndex) {
                    // If current category is the last category - Navigate to setup-detail page
                    helpers.navigate.to("setup-detail", {
                        "setupId": api.context.props.setupId
                    }, {
                        "customId": new Date().getTime()
                    });
                } else {
                    // Goto next category
                    helpers.modal.open('next_category_modal', {
                        bare: true
                    });
                    var interval = helpers.timing.setInterval(function() {
                        helpers.timing.clearInterval(interval);
                        helpers.modal.close('next_category_modal');
                        helpers.navigate.to("step", {
                            "setupId": api.context.props.setupId,
                            "categoryId": categories[categoryIndex + 1].sys_id.value
                        });
                        return;
                    }, 4000);
                }
            }

        } else {
            // Goto next task
            api.setState('currentTaskId', [
                [allTasks[taskIndex + 1].sys_id.value]
            ]);
            helpers.navigate.setRouteParams({
                'params': {
                    'taskId': allTasks[taskIndex + 1].sys_id.value
                }
            });
        }
    }
}
