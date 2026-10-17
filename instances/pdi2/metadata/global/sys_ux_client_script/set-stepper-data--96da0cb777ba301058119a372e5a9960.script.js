/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let currentStep = '';
    var flowStates = [];
    helpers.translate('Draft').then((value) => {
        flowStates.push({
            "id": "Ideation",
            label: value
        });
    });
    helpers.translate('Review').then((value) => {
        flowStates.push({
            "id": "Deploy",
            label: value
        });
    });
    helpers.translate('Published').then((value) => {
        flowStates.push({
            "id": "Operational",
            label: value
        });
    });
    helpers.translate('Expired').then((value) => {
        flowStates.push({
            "id": "End of Life",
            label: value
        });
        var i = 0;
        for (; i < flowStates.length; i++) {
            if (flowStates[i].id != api.data.business_process_record.result.life_cycle_stage.value) {
                flowStates[i]['progress'] = 'done';
                flowStates[i]['sublabel'] = 'Complete';
                flowStates[i]['disabled'] = false;
            } else {
                break;
            }
        };
        currentStep = flowStates[i].id;
        flowStates[i]['progress'] = 'partial';
        flowStates[i]['sublabel'] = 'In progress';
        flowStates[i]['disabled'] = false;
        i++;
        for (; i < flowStates.length; i++) {
            flowStates[i]['progress'] = 'none';
            flowStates[i]['sublabel'] = 'Upcoming';
            flowStates[i]['disabled'] = false;
        };
        if (api.data.business_process_record.result.life_cycle_stage.value == 'End of Life') {
            flowStates[3]['progress'] = 'done';
            flowStates[3]['sublabel'] = 'Complete';
            flowStates[3]['disabled'] = false;
        }
        api.setState('currentStep', currentStep);
        api.setState('stateData', flowStates);
    });
}
