/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({api, event, helpers, imports}) {
    const model = api.data.fetch_promin_root_model_transitions_1.output.data.GlidePromin_Query.scheduleModel;
    const activities = model.modelDefinition.activities.reduce((accumulator, item) => {
        accumulator[item.id] = { ...item };
        return accumulator;
    }, {});
    const nodes = model.nodes.reduce((accumulator, item) => {
        accumulator[item.key] = {
            ...item,
            activity: activities[item.activityId] || null,
        };
        return accumulator;
    }, {});
    api.setState('nodes', nodes);

    const labels = {
        defaultTransitionType: await helpers.translate('Overall Transitions'),
        caseFreq: await helpers.translate('Unique Occurrences'),
        absoluteFreq: await helpers.translate('Total Occurrences'),
        avgDuration: await helpers.translate('Avg Duration'),
        totalDuration: await helpers.translate('Total Duration'),
        maxReps: await helpers.translate('Max Repeat Occurrences'),
        stdDeviation: await helpers.translate('Std Deviation'),
        medianDuration: await helpers.translate('Med Duration'),
    };

    const transitionMetrics = [];
    const transitionTypes = [];
    const transitions = model.modelTransitions.reduce((accumulator, item) => {
        // Push the transition type
        transitionTypes.push({
            id: item.activity.id,
            label: item.activity.label || labels.defaultTransitionType,
        });

        accumulator[item.activity.id] = item.transitions.reduce((accumulator, transitionItem) => {
            // Get the metric
            if (!transitionMetrics.includes(transitionItem.metric))
                transitionMetrics.push(transitionItem.metric);

            // Add the edges
            const edges = [ ...transitionItem.edges];
            edges.sort((a, b) => {
                return b[transitionItem.metric] - a[transitionItem.metric];
            });
            accumulator[transitionItem.metric] = edges;
            return accumulator;
        }, {});

        return accumulator;
	}, {});

    api.setState('transitionTypes', transitionTypes);
    api.setState('transitionMetrics', transitionMetrics.map(metric => ({
        id: metric,
        label: labels[metric] || '',
    })));
    api.setState('allTransitions', transitions);
    api.setState('currentTransitionMetric', [transitionMetrics[0]]);

    // Import formatting of numbers
    const {
        formatNumber,
        formatDuration
    } = imports["global.prominUtils"]();

    // Now, let's get the current transitions
    const type = api.state.currentTransitionType[0];
    const metric = transitionMetrics[0];
    
    // Calculate pagination data
    const itemsPerPage = api.state.transitionsPerPage;
    const totalPages = Math.ceil(api.state.transitionsTotal / itemsPerPage);
    const currentPage = 0;

    // Get the items
    const allTransitions = (transitions[type] || {})[metric] || [];

    // Set the number of total transitions (for pagination)
    api.setState('transitionsTotal', allTransitions.length);

    // Import the transitions formatter
    const {
        getTransitions,
    } = imports["global.prominUtils"]();

    api.setState('currentTransitionData', getTransitions({
        transitions: allTransitions,
        nodes,

		itemsPerPage, 
		totalPages, 
		currentPage, 
    }));

    // Update the page as well
    api.setState('currentTransitionsPage', 0);
}
