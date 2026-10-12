/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    let selectedTaskStep = api.state.selectedTaskStep;
    let disabled = true;
    switch (selectedTaskStep) {
        case 1:
            disabled = api.state.disabledSteps.step1;
            break;
        case 2:
            disabled = api.state.disabledSteps.step2;
            break;
        case 3:
            disabled = api.state.disabledSteps.step3;
            break;
        default:
            disabled = true;
    }
    return disabled;
}
