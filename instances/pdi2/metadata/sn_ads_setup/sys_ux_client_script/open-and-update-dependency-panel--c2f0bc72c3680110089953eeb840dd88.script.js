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
    if (event.elementId == 'remove_dependency') {
        helpers.snHttp(`api/sn_ads_setup/build/dependency/${api.state.dependencyPanel.m2mId}/step/${api.data.get_setup_step.output.result.sys_id}`, {
                method: 'DELETE',
                batch: false
            })
            .then(({
                response
            }) => {
                api.data.get_setup_summary_1.refresh();
                api.data.get_dependencies_1.refresh();
            })
            .catch(({
                error
            }) => {
                //TODO: Open notification
                console.log(error);
            });
        return;
    } else if (event.name == 'SN_HELP_SETUP_DEPENDENCY_PANEL#SAVE_CLICKED') {
        const {
            dependencyPanel
        } = api.state;
        let dependentStepIds = event.payload.selectedItems.filter(item => {
            if (event.payload.selectedConfig == '1')
                return item.length == 2; // selectedItems might contain both category selections and task selections. Since tasks are in second level under category, each task selection is a array of size 2.
            else
                return item.length == 1;
        }).map(item => {
            if (event.payload.selectedConfig == '1') {
                return item[1];
            } else {
                return item[0];
            }
        });
        let body = {
            dependent_on_steps: dependentStepIds
        };
        let m2mId = dependencyPanel.m2mId || '-1';
        let method = dependencyPanel.m2mId ? 'PUT' : 'POST';
        if (body.dependent_on_steps.length == 0) {
            if (m2mId != '-1')
                method = 'DELETE';
            else {
                // Returning if none is selected and there is no m2mId
                return;
            } 
        }
        helpers.snHttp(`api/sn_ads_setup/build/dependency/${m2mId}/step/${dependencyPanel.selectedTaskId}`, {
                method,
                batch: false,
                body
            })
            .then(({
                response
            }) => {
                api.setState('dependencyPanel', {...dependencyPanel, opened: false});
                api.data.get_setup_summary_1.refresh();
                api.data.get_dependencies_1.refresh();
            })
            .catch(({
                error
            }) => {
                //TODO: Open notification
                console.log(error);
            });
        return;

    }
    let taskItems = [];
    let catItems = [];
    let steps = api.data.get_setup_summary_1.output.result.setup.steps; // Returns all categories
    let tasks = api.data.get_setup_summary_1.output.result.setup.tasks; // Returns all tasks in the category
    let stepIndex = steps.findIndex(function(step) {
        return step.id == api.data.get_task_info.result.parent.value;
    }); // Returns the index of the category of the task user clicked on
    let isFirstCategory = stepIndex === 0;
    let pluginCat = steps.find(step => step.isPluginCategory); 
    let pluginCatId = pluginCat ? pluginCat.id : '';
    for (let i = 0; i <= stepIndex; i++) {
        let taskItem = {
            id: steps[i].name,
            label: steps[i].name,
            disabled: true,
            children: []
        };
        if (i < stepIndex)
            catItems.push({
                id: steps[i].id,
                label: steps[i].name
            });
        let children = tasks.filter(function(task) {
            return task.lane_id == steps[i].id;
        });
        if (steps[i].id == pluginCatId) {
            // If plugin category only show advance plugin task
            children = children.filter(child => Number(child.order) == 1);
        }
        children.sort((a, b) => (Number(a.order) > Number(b.order)) ? 1 : ((Number(b.order) > Number(a.order)) ? -1 : 0));
        if (i == stepIndex)
            children = children.filter(child => Number(child.order) < Number(api.data.get_task_info.result.order.value));
        children = children.map(child => {
            return {
                id: child.id,
                label: child.name
            };
        });
        taskItem.children = [...children];
        if (children.length > 0)
            taskItems.push(taskItem);
    }

    let isFirstTaskOfFirstCat = stepIndex === 0 && taskItems.length === 0;

    if (isFirstTaskOfFirstCat && event.elementId == 'select_event_link') {
        helpers.translate("No prior task available to add dependency condition").then(value => {
            var alerts = [{
                id: "error",
                status: "critical",
                icon: "exclamation-triangle-outline",
                content: value,
                action: {
                    type: "dismiss"
                }
            }];
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: alerts
            });
        });
        return;
    }
    let dependencyPanel = {
        heading: api.state.pageInput.step1.name,
        taskItems,
        catItems,
        isFirstCategory,
        isFirstTaskOfFirstCat,
        selectedConfig: '1',
        selectedTaskId: api.state.currentTaskId[0][0],
        m2mId: "",
        loading: false
    };
    if (event.elementId == 'edit_dependency' || event.elementId == 'select_event_link')
        dependencyPanel['opened'] = true;
    else
        dependencyPanel['opened'] = api.state.dependencyPanel.opened;

    let {
        dependencies
    } = api.data.get_dependencies_1.output.result;

    if (dependencies.length > 0) {
        const {
            dependency: allDependencies
        } = dependencies[0];
        dependencyPanel.selectedItems = allDependencies.map(dep => {
            if (dep.type == 'activity') {
                // Task dependency
                let parent = steps[steps.findIndex(function(step) {
                    return step.id == dep.parent;
                })].name;
                return [parent, dep.sys_id];
            } else {
                // Category dependency
                return [dep.sys_id];
            }
        });
        if (allDependencies.length > 0 && allDependencies[0].type != 'activity')
            dependencyPanel.selectedConfig = '2';
        else
            dependencyPanel.selectedConfig = '1';
        dependencyPanel.m2mId = dependencies[0].m2mId;
    } else {
        dependencyPanel.selectedItems = [];
    }
    api.setState('dependencyPanel', dependencyPanel);
    
    return;
}
