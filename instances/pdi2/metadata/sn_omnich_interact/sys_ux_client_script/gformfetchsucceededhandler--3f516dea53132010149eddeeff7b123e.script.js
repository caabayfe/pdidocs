/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    // In order to reduce calls of data broker, we need to call data broker when necessary. So I implement following logic.
    // Event, Glide Form data broker fetches succeeded, is triggered before event, Glide Form data broker fetch status updated.
    // But when event SUCCEEDED is triggered, the header data is still undefined. And we couldn't get payload data from handler of event UPDATED.
    // So here I save state and assignedTo to state. And then the handler of event UPDATED will fetch them from state.
    const recordValues = event.payload.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query.formLayout.recordValues;

    const interactionState = recordValues.find(item => item.name === 'state').value;
    const interactionAssignedTo = recordValues.find(item => item.name === 'assigned_to').value;

    api.setState('interactionState', interactionState);
    api.setState('interactionAssignedTo', interactionAssignedTo);
}
