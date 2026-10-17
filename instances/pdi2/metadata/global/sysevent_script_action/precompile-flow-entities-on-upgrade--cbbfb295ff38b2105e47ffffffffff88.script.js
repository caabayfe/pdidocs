triggerFlowEntitiesPrecompileOnUpgrade();

/**
 * Triggers pre-compilation of frequently executed flow entities.
 * - Fetches precompile limits for actions and flows.
 * - Fetches the minimum execution threshold for pre-compilation.
 * - Skips execution if both limits are zero or if no frequently executed entities meet the threshold.
 * - Fetches frequently executed flow entities (executed at least the threshold number of times) and triggers pre-compilation.
 */
function triggerFlowEntitiesPrecompileOnUpgrade() {
    let flow_compiler_utils = new global.FlowCompilerUtils();
    let precompile_actions_limit = flow_compiler_utils.getPrecompileActionsLimit();
    let precompile_flows_limit = flow_compiler_utils.getPrecompileFlowsLimit();

    if (precompile_actions_limit <= 0 && precompile_flows_limit <= 0) {
        gs.info("Pre-compilation skipped: Both actions and flows precompile limits are <= 0.");
        return;
    }

    let flow_entities = _fetchFrequentlyExecutedFlowEntities(precompile_actions_limit, precompile_flows_limit);
    if (flow_entities.actions.length === 0 && flow_entities.flows.length === 0) {
        gs.info("Pre-compilation skipped: No flow entities met the execution threshold.");
        return;
    }

    // Triggers asynchronous pre-compilation of selected actions and flows
    flow_compiler_utils.preCompileActionsAndFlowsAsync(flow_entities.actions, flow_entities.flows);
}

/**
 * Fetches frequently executed flow entities from the 'ua_hub_execution_usage' table.
 * - Aggregates usage data to identify top-executed flow entities.
 * - Filters entities based on the minimum execution threshold.
 * - Applies precompile limits for actions and flows.
 * - Stops early when both limits are reached.
 *
 * @private
 * @param {number} precompile_actions_limit - Maximum number of actions to precompile.
 * @param {number} precompile_flows_limit - Maximum number of flows to precompile.
 * @returns {Object} An object containing arrays of action IDs and flow IDs that meet the threshold.
 */
function _fetchFrequentlyExecutedFlowEntities(precompile_actions_limit, precompile_flows_limit) {
    let flow_entities = {
        actions: [],
        flows: []
    };

    let table_utils = new global.TableUtils('ua_hub_execution_usage');
    if (!table_utils.tableExists()) {
        gs.info("Pre-compilation failed: 'ua_hub_execution_usage' table doesn't exist.");
        return flow_entities;
    }

    let precompile_execution_threshold = _fetchPrecompileExecutionThreshold();
    let execution_usage_ga = new GlideAggregate('ua_hub_execution_usage');
    execution_usage_ga.setWorkflow(false);
    execution_usage_ga.addQuery('sys_updated_on', '>=', gs.daysAgoStart(30));
    // Aggregate SUM on agg_value
    execution_usage_ga.addAggregate('SUM', 'agg_value');
    // Group by artifact_id and artifact_type
    execution_usage_ga.groupBy('artifact_id');
    execution_usage_ga.groupBy('artifact_type');
    if (precompile_execution_threshold > 0) {
        // Add HAVING clause to filter SUM(agg_value) >= precompile_execution_threshold
        execution_usage_ga.addHaving('SUM', 'agg_value', '>=', precompile_execution_threshold);
    }

    // Order by SUM(agg_value) descending
    execution_usage_ga.orderByAggregate('SUM', 'agg_value');
    execution_usage_ga.query();

    while (execution_usage_ga.next()) {
        let artifact_id = execution_usage_ga.getValue('artifact_id');
        if (!artifact_id)
            continue;

        let artifact_type = execution_usage_ga.getValue('artifact_type');
        if (artifact_type == 'action' && flow_entities.actions.length < precompile_actions_limit)
            flow_entities.actions.push(artifact_id);
        else if ((artifact_type == 'flow' || artifact_type == 'subflow') && flow_entities.flows.length < precompile_flows_limit)
            flow_entities.flows.push(artifact_id);

        // Stop early if both limits are reached
        if (flow_entities.actions.length >= precompile_actions_limit && flow_entities.flows.length >= precompile_flows_limit)
            break;
    }

    return flow_entities;
}

/**
 * Fetches the minimum execution threshold for pre-compilation.
 * 
 * @private 
 * @returns {number} Threshold value (minimum executions required for pre-compilation).
 */
function _fetchPrecompileExecutionThreshold() {
    return parseInt(gs.getProperty('com.glide.hub.flow_engine.precompile_execution_threshold', 10));
}
