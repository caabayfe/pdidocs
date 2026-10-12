/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { value } = event.payload;
    api.setState('currentTransitionsPage', value);
    
    const type = api.state.currentTransitionType[0];
    const metric = api.state.currentTransitionMetric[0];
    const transitions = (api.state.allTransitions[type] || {})[metric] || [];
    const nodes = api.state.nodes || {};
    const caseCount = api.state.caseCount;

    // Calculate pagination data
    const itemsPerPage = api.state.transitionsPerPage;
    const totalPages = Math.ceil(api.state.transitionsTotal / itemsPerPage);
    const currentPage = value;

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
