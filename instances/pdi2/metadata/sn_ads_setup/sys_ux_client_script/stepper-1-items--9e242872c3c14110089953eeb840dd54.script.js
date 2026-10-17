/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api,
    helpers
}) {
    let stepper = [{
        id: 1,
        label: helpers.translateSync("Basic Info")
    }, {
        id: 2,
        label: helpers.translateSync("Configure Task")
    }, {
        id: 3,
        label: helpers.translateSync("Task Settings")
    }];
    for (var i = 0; i < 3; i++) {
        if (i < api.state.taskStepStatus - 1 || api.state.taskStepStatus == 0)
            stepper[i].progress = "done";
        else if (i > api.state.taskStepStatus - 1)
            stepper[i].disabled = true;
    }

    return stepper;
}
