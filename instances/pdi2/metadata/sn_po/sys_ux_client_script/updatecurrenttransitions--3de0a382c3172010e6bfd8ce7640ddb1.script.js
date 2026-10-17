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
    const includeStartStop = event.elementId === 'transitionsIncludeStartStopCheckbox' ? event.payload.value : api.state.transitionsIncludeStartStop;
    const search = event.elementId === 'transitionsSearchTermInput' ? event.payload.searchTerm : (api.state.transitionsSearchTerm || '');
    
    const nodes = api.state.nodes || {};
    const edges = api.state.edges || [];
    const entities = api.state.entities || {};
    const caseCount = api.state.caseCount;

    if (event.elementId === 'transitionTypeDropdown')
        api.setState('currentTransitionType', event.payload.value);

    if (event.elementId === 'transitionMetricDropdown')
        api.setState('currentTransitionMetric', event.payload.value);

    if (event.elementId === 'transitionsIncludeStartStopCheckbox')
        api.setState('transitionsIncludeStartStop', event.payload.value);

    if (event.elementId === 'transitionsSearchTerm')
        api.setState('transitionsSearchTerm', event.payload.searchTerm);
        
    // Make the transitions
    const {
        makeTransitions,
    } = imports["global.prominUtils"]();
    
    const transitions = makeTransitions({
        edges,
        nodes,
        entities,
        type,
        metric,
        search,
        includeStartStop,
    });

    // Set the number of total transitions (for pagination)
    api.setState('allTransitions', transitions);
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
    
    const currentTransitions = getTransitions({
        transitions,
        nodes,

        itemsPerPage, 
        totalPages, 
        currentPage, 
        caseCount,
    });
    api.setState('currentTransitionData', currentTransitions);
}
