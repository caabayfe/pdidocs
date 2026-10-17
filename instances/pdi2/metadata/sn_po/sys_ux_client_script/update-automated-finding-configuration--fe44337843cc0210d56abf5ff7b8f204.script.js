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
    if(event.elementId != 'continue_later' && !api.state.configUpdated) {
        if (api.state.automatedFindingForm.name?.applyToSource === 'project') {
            // Navigate to Set improvement opportunities page in project setup
            helpers.navigate.to('promin_project', {
                projectId: api.context.props.projectId,
                stage: 'find-improvement-opportunities'
            }, null, true);
        } else {
            // Navigate to process configuration page
            helpers.navigate.to('process-configuration-details', {
                processId: api.context.props.projectId,
                step: 'improvement-opportunities'
            }, {
                activeTab: 'AUTOMATED'
            }, true);
        }
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
        return;
    }
    const automatedFindingForm = { ...api.state.automatedFindingForm
    };
    let alert = { ...api.state.alert
    };
    for (let [key, value] of Object.entries(alert[api.state.automatedFindingForm.type.value])) {
        alert[api.state.automatedFindingForm.type.value][key].visible = true;
        alert[api.state.automatedFindingForm.type.value][key].message = '';
    }
    api.setState('alert', alert);
    let findingConfigPayload = {};
    let findingConfigurationMap = {...api.state.findingConfigurationMap};
    for (const [key, item] of Object.entries(api.state.findingConfigurationMap)) {
        const regex = new RegExp('^[0-9]+$');
        const val = item.value;
        if (item.invalid) {
            return;
        }
        if ((key == 'minRatio' || key == 'maxRatio') && regex.test(item.value) || val.toString().includes('.')) {
            if(val.toString().includes('.')){
                findingConfigurationMap[key].invalid = true;
                alert[api.state.automatedFindingForm.type.value][key].message = "The above mandatory field is Invalid or not filled in.";
                alert[api.state.automatedFindingForm.type.value][key].visible = false;
                return;
            }
            findingConfigPayload[item.sys_id] = item.value == 0 ? 0 : (100 / item.value);
        } else {
            findingConfigPayload[item.sys_id] = item.value;
        }
    }
    api.data.update_automated_finding_configuration.execute({
        findingConfigPayload: JSON.stringify(findingConfigPayload)
    });
}
