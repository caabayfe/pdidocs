/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    const values = event.payload.value;
    const project = api.data.fetch_promin_header_state_2.output.data.GlidePromin_Query.scheduleModel.project;
    const defaultHeaderComponent = 'projectMetrics';
    let selectedHeaderComponent = defaultHeaderComponent;

    // This `event` is coming from the Dropdown component
    if (Array.isArray(values)) {
        selectedHeaderComponent = values[0];
    }

    api.setState('selectedHeaderComponent', selectedHeaderComponent);
}
