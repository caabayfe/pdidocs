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
   
    if (api.state.findingId) {
         const stageItems = api.state.stepper.map((item) => {
        let state = 'done';
        return { ...item,
            disabled: false,
            progress: item.id == api.state.selectedStage ? 'none' : state
        };
    });
    api.setState('stepper', stageItems);
        if (event.payload.value == 'configure' || event.payload.value == 'summary') {
            api.data.look_up_finding_configuration.refresh();
        }
       
    }
}
