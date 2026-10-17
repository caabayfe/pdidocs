/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({api, event, helpers, imports}) {
    // Import util functions
    const {
        formatNumber,
        formatDuration,
        getRootModel,
        makeTransitions,
    } = imports["global.prominUtils"]();

    const model = api.data.fetch_promin_root_model_transitions_1.output.data.GlidePromin_Query.scheduleModel;
    
    const {
        rootAggregate: {
            model: {
                caseCount
            }
        },
    } = getRootModel(model);
    api.setState('caseCount', caseCount);

    const nodes = model.nodes.reduce((accumulator, item) => {
        accumulator[item.key] = {
            ...item,
        };
        return accumulator;
    }, {});
    api.setState('nodes', nodes);
    
    const edges = model.edges;
    api.setState('edges', edges);

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
    
    // Make the metrics
    const transitionMetrics = ['caseFreq', 'totalDuration', 'avgDuration', 'maxReps', 'absoluteFreq', 'stdDeviation', 'medianDuration'].map((item) => {
        return {
    		id: item,
    		label: labels[item] || '',
    	};
    });
    api.setState('transitionMetrics', transitionMetrics);
    
    // Make the transition types
    const transitionTypes = [{
        id: 'ALL',
        label: labels.defaultTransitionType,
    }];
    
    const entities = {};
    model.projectEntities.forEach((entity) => {
    
        // Save the entity
        entities[entity.entityId] = entity;
        
        const group = {
            id: entity.entityId,
            label: entity.name,
            children: [],
        };
        
        entity.activities.forEach((activity) => {
            group.children.push({
                id: activity.id,
                label: activity.displayName || activity.label,
            });
        });
        
        transitionTypes.push(group);
    });
    api.setState('entities', entities);
    api.setState('transitionTypes', transitionTypes);

    // Search and include start stop
    const search = api.state.transitionsSearchTerm || '';
    const includeStartStop = api.state.transitionsIncludeStartStop;

    // Now, let's get the current transitions
    const type = transitionTypes[0].id;
    const metric = transitionMetrics[0].id;

    // Make the transitions
    const transitions = makeTransitions({
        edges,
        nodes,
        entities,
        type,
        metric,
        search,
        includeStartStop,
    });

    api.setState('allTransitions', transitions);
    api.setState('currentTransitionMetric', [metric]);
    api.setState('currentTransitionType', [type]);
    
    // Calculate pagination data
    const itemsPerPage = api.state.transitionsPerPage;
    const totalPages = Math.ceil(api.state.transitionsTotal / itemsPerPage);
    const currentPage = 0;

    // Set the number of total transitions (for pagination)
    api.setState('transitionsTotal', transitions.length);

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

    // Update the page as well
    api.setState('currentTransitionsPage', 0);
}
