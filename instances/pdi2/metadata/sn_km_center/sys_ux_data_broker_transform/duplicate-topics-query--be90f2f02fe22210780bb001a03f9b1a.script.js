/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function transform({ api, helpers }) {
    // Initialize the result object
    const result = [];

    if (!(gs.hasRole('knowledge_admin') || gs.hasRole('knowledge_manager'))) {
        return result; // Ineligible session: don't run the action_strategy-gated query at all
    }

    // Perform the GlideAggregate query
    const ga = new GlideAggregate('kb_duplicate_articles');
    ga.addQuery('action_strategy.active', true); // Add condition: Action Strategy . Active is true
    ga.addAggregate('COUNT'); // Example aggregation: Count records
    ga.groupBy('description'); // Group by Description
    ga.query();

    // Process the results
    while (ga.next()) {
        result.push({
            description: ga.getValue('description'), // Get the grouped field
            count: ga.getAggregate('COUNT') // Get the aggregated count
        });
    }

    // Return the result
    return result;
}
