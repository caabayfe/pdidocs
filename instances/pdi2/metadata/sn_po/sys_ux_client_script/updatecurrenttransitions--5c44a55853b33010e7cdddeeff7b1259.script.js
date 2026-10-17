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
    const type = event.elementId === 'transitionTypeDropdown' ? event.payload.value[0] : api.state.currentTransitionType[0];
    const metric = event.elementId === 'transitionMetricDropdown' ? event.payload.value[0] : api.state.currentTransitionMetric[0];
    const transitions = (api.state.allTransitions[type] || {})[metric] || [];
    const nodes = api.state.nodes || {};
    const caseCount = api.state.caseCount;

    if (event.elementId === 'transitionTypeDropdown')
        api.setState('currentTransitionType', event.payload.value);

    if (event.elementId === 'transitionMetricDropdown')
        api.setState('currentTransitionMetric', event.payload.value);

    // Set the number of total transitions (for pagination)
    api.setState('transitionsTotal', transitions.length);

    // Update the page
    api.setState('currentTransitionsPage', 0);

    // Calculate pagination data
    const itemsPerPage = api.state.transitionsPerPage;
    const totalPages = Math.ceil(api.state.transitionsTotal / itemsPerPage);
    const currentPage = 0;

    // Import the transitions formatter
    const {
        getTransitions,
    } = imports["global.prominUtils"]();

    api.setState('currentTransitionData', getTransitions({
        transitions,
        nodes,

        itemsPerPage,
        totalPages,
        currentPage,
        caseCount,
    }));
}
