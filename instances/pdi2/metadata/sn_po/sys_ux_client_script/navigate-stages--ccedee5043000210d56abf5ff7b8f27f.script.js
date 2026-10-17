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

    if(event.elementId == 'previous'){
        api.setState('selectedStage','details');
        const stageItems = api.state.stepper.map((item) => {
            return { ...item,
                disabled: false,
                progress: item.id == 'details' ? 'none' : 'done'
            };
        });
        api.setState('stepper', stageItems);
        return;
    }
    if (event.elementId == "save_exit" || event.elementId == "cancel") {
        if (api.state.automatedFindingForm.name.applyToSource == "project") {
            helpers.navigate.to("promin_project", {
                projectId: api.context.props.projectId,
                stage: 'find-improvement-opportunities'
            }, null, true);
        } else {
            helpers.navigate.to('process-configuration-details', {
                processId: api.context.props.projectId,
                step: 'improvement-opportunities'
            }, {
                activeTab: 'AUTOMATED'
            }, true);
        }

    } else {
        const applyToSource = api.state.automatedFindingForm.name.applyToSource;
        if (applyToSource == 'project') {
            helpers.navigate.to("findings", {}, {
                projectId: api.state.automatedFindingForm.name.sys_id,
            }, true);
        } else {
            helpers.navigate.to("findings", {}, {
                processId: api.state.automatedFindingForm.name.sys_id
            }, true);
        }
    }
    if (event.elementId == 'save_exit' || event.elementId == 'cancel' || event.elementId == "cancel_configure") {
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    }
}
