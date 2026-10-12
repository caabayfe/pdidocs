var FlowCompilerUtils = Class.create();
FlowCompilerUtils.prototype = {
    PRECOMPILE_ACTION_LIMIT_DEFAULT: 50, // Default number of actions to precompile
    MAX_PRECOMPILE_ACTION_LIMIT: 100, // Maximum number of actions to precompile
    PRECOMPILE_FLOW_LIMIT_DEFAULT: 100, // Default number of flows to precompile
    MAX_PRECOMPILE_FLOW_LIMIT: 200, // Maximum number of flows to precompile
    SYS_TRIGGER_NAME: "Precompile Actions & Flows",
    SYS_TRIGGER_TYPE: '0', // Run Once
    SYS_TRIGGER_STATE: '0', // Ready
    SYS_TRIGGER_JOB_ID: "81c92ce9c0a8016400e5f0d2f784ea78",

    initialize: function() {
        this.precompile_actions_limit = Math.min(
            parseInt(gs.getProperty('com.glide.hub.flow_engine.precompile_actions_limit', this.PRECOMPILE_ACTION_LIMIT_DEFAULT)),
            this.MAX_PRECOMPILE_ACTION_LIMIT
        );
        this.precompile_flows_limit = Math.min(
            parseInt(gs.getProperty('com.glide.hub.flow_engine.precompile_flows_limit', this.PRECOMPILE_FLOW_LIMIT_DEFAULT)),
            this.MAX_PRECOMPILE_FLOW_LIMIT
        );

        if (this.precompile_actions_limit < 0)
            this.precompile_actions_limit = 0;

        if (this.precompile_flows_limit < 0)
            this.precompile_flows_limit = 0;
    },

    /**
     * Creates a scheduled job to precompile actions and flows asynchronously.
     * @param {Array} actions - Array of sys_ids for action type definitions.
     * @param {Array} flows - Array of sys_ids for flows or subflows.
     */
    preCompileActionsAndFlowsAsync: function(actions, flows) {
        if (!Array.isArray(actions) || !Array.isArray(flows)) {
            gs.info("[FlowCompilerUtils] Invalid input: actions and flows must be arrays.");
            return;
        }

        if (actions.length === 0 && flows.length === 0) {
            gs.info("[FlowCompilerUtils] No actions or flows provided for pre-compilation.");
            return;
        }

        // Skip scheduling if both limits are zero
        if (this.precompile_actions_limit === 0 && this.precompile_flows_limit === 0) {
            gs.info("[FlowCompilerUtils] Skipping job scheduling: both actions and flows precompile limits are 0.");
            return;
        }

        gs.info("[FlowCompilerUtils] Scheduling pre-compilation for " +
            Math.min(actions.length, this.precompile_actions_limit) + " action(s) and " +
            Math.min(flows.length, this.precompile_flows_limit) + " flow(s).");

        this._createRunOnceScheduledJobForPreCompile(actions.join(','), flows.join(','));
    },

    /**
     * Pre-compiles actions and flows.
     * - Compiles actions and retrieves associated flows.
     * - Compiles flows (including those retrieved via actions).
     * 
     * @param {String} action_sys_ids - Comma-separated sys_ids of actions.
     * @param {String} flow_sys_ids - Comma-separated sys_ids of flows.
     */
    preCompileActionsAndFlows: function(action_sys_ids, flow_sys_ids) {
        let actions = action_sys_ids ? action_sys_ids.split(',').map(item => item.trim()).filter(Boolean) : [];
        let flows = flow_sys_ids ? flow_sys_ids.split(',').map(item => item.trim()).filter(Boolean) : [];

        if (actions.length > 0) {
            // Compile actions
            let compiled_action_ids = this._preCompileActivePublishedActions(actions, this.precompile_actions_limit);
            // Retrieve flows linked to these actions
            let flows_by_action_type = this._retrieveFlowsUsingActions(compiled_action_ids);
            if (flows_by_action_type && flows_by_action_type.length > 0) {
                gs.info("[FlowCompilerUtils] Retrieved " + flows_by_action_type.length +
                    " flow(s) associated with actions for pre-compilation.");
                flows = [...new Set(flows.concat(flows_by_action_type))];
            }
        }

        // Compile flows
        if (flows.length > 0)
            this._preCompileActivePublishedFlows(flows, this.precompile_flows_limit);
    },

    /**
     * Returns the configured limit for pre-compiling actions.
     * @returns {Number} precompile_actions_limit
     */
    getPrecompileActionsLimit: function() {
        return this.precompile_actions_limit;
    },

    /**
     * Returns the configured limit for pre-compiling flows.
     * @returns {Number} precompile_flows_limit
     */
    getPrecompileFlowsLimit: function() {
        return this.precompile_flows_limit;
    },

    /**
     * Creates a sys_trigger record to run the pre-compilation job.
     * 
     * @private
     * @param {String} action_sys_ids - Comma-separated sys_ids of actions.
     * @param {String} flow_sys_ids - Comma-separated sys_ids of flows.
     */
    _createRunOnceScheduledJobForPreCompile: function(action_sys_ids, flow_sys_ids) {
        let job_script = "new global.FlowCompilerUtils().preCompileActionsAndFlows('" + action_sys_ids + "','" + flow_sys_ids + "');";

        let trigger_gr = new GlideRecord('sys_trigger');
        trigger_gr.setValue('name', this.SYS_TRIGGER_NAME);
        trigger_gr.setValue("job_id", this.SYS_TRIGGER_JOB_ID);
        trigger_gr.setValue('trigger_type', this.SYS_TRIGGER_TYPE);
        trigger_gr.setValue('state', this.SYS_TRIGGER_STATE);
        trigger_gr.setValue('next_action', new GlideDateTime());
        trigger_gr.setValue("script", job_script);
        trigger_gr.insert();
    },

    /**
     * Pre-compiles active, published action type definitions.
     * - Queries 'sys_hub_action_type_definition' for provided sys_ids.
     * - Attempts to compile each action using FlowAPI.
     * 
     * @private
     * @param {Array} actions - Array of sys_ids representing action type definitions.
     * @param {number} limit - Maximum number of actions to pre-compile.
     * 
     * @returns {Array} Array of sys_ids for successfully compiled active, published actions.
     */
    _preCompileActivePublishedActions: function(actions, limit) {
        let compiled_action_ids = [];
        let actions_gr = new GlideRecord('sys_hub_action_type_definition');
        actions_gr.setWorkflow(false);
        actions_gr.addQuery('sys_id', 'IN', actions.join());
        actions_gr.addQuery('active', true);
        actions_gr.addQuery('state', 'published');
        actions_gr.setLimit(limit);
        actions_gr.query();
        while (actions_gr.next()) {
            let scope = actions_gr.sys_scope.scope;
            let internal_name = actions_gr.getValue('internal_name');
            if (scope && internal_name) {
                let name = scope + "." + internal_name;
                try {
                    let compilation_succeeded = sn_fd.FlowAPI.getRunner().action(name).compile();
                    if (compilation_succeeded)
                        compiled_action_ids.push(actions_gr.getUniqueValue());
                    else
                        gs.info("[FlowCompilerUtils] Pre-compilation failed for action: " + name);

                } catch (e) {
                    gs.info("[FlowCompilerUtils] Exception pre-compiling action '" + name + "': " + e.message);
                }
            }
        }

        return compiled_action_ids;
    },

    /**
     * Retrieves flows associated with given action type sys_ids.
     * - Uses FlowAPI to fetch flows linked to each action.
     * 
     * @private
     * @param {Array} actions - Array of action type sys_ids.
     * @returns {Array} Array of flow sys_ids associated with actions.
     */
    _retrieveFlowsUsingActions: function(actions) {
        let flows = [];
        for (let i = 0; i < actions.length; i++) {
            try {
                let action_type_flows = sn_fd.FlowAPI.getFlowsByActionTypeId(actions[i]);
                if (action_type_flows)
                    flows = flows.concat(action_type_flows);
            } catch (e) {
                gs.info("[FlowCompilerUtils] Failed to retrieve flows for action sys_id '" + actions[i] + "': " + e.message);
            }
        }

        return flows;
    },

    /**
     * Pre-compiles active, published flows or subflows.
     * - Queries 'sys_hub_flow' for provided sys_ids.
     * - Compiles each flow using FlowAPI based on type.
     * 
     * @private
     * @param {Array} flows - Array of sys_ids representing flows or subflows.
     * @param {number} limit - Maximum number of flows to pre-compile.
     */
    _preCompileActivePublishedFlows: function(flows, limit) {
        let flows_gr = new GlideRecord('sys_hub_flow');
        flows_gr.setWorkflow(false);
        flows_gr.addQuery('sys_id', 'IN', flows.join());
        flows_gr.addQuery('active', true);
        flows_gr.addQuery('status', 'published');
        flows_gr.setLimit(limit);
        flows_gr.query();
        while (flows_gr.next()) {
            let scope = flows_gr.sys_scope.scope;
            let internal_name = flows_gr.getValue('internal_name');
            if (scope && internal_name) {
                let name = scope + "." + internal_name;
                let type = flows_gr.getValue('type');
                try {
                    let compilation_succeeded = true;
                    if (type == 'flow')
                        compilation_succeeded = sn_fd.FlowAPI.getRunner().flow(name).compile();
                    else if (type == 'subflow')
                        compilation_succeeded = sn_fd.FlowAPI.getRunner().subflow(name).compile();
                    else
                        continue;

                    if (!compilation_succeeded) {
                        gs.info("[FlowCompilerUtils] Pre-compilation failed for flow: " + name);
                    }
                } catch (e) {
                    gs.info("[FlowCompilerUtils] Exception pre-compiling flow '" + name + "': " + e.message);
                }
            }
        }
    },

    type: 'FlowCompilerUtils'
};
