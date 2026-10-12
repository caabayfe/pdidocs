var ActionExecutionUtils = Class.create();
ActionExecutionUtils.prototype = {
    initialize: function() {},

    /**
     * Evaluate a UI Action's server-side "condition" exactly as the platform would,
     * but callable from any scope. Returns a boolean.
     *
     * @param {GlideRecord} currentGR - The target record against which to evaluate.
     * @param {String} uiActionSysId  - Sys ID of the sys_ui_action record whose condition to evaluate.
     * @returns {Boolean}
     */
    evaluateUIActionCondition: function(currentGR, uiActionSysId) {
        // Basic guards
        if (!currentGR || !currentGR.isValidRecord() || !uiActionSysId)
            return false;

        // 0) Ensure user can read the target record (don’t surface actions for records they can’t see)
        if (!currentGR.canRead())
            return false;

        // 1) Load the UI Action
        var act = new GlideRecord('sys_ui_action');
        act.get(uiActionSysId);
        if (!act)
            return false;

        // 2) Must be active
        if (act.active.toString() !== 'true')
            return false;

        // 3) Role gate: the "roles" field is a comma-separated OR list
        if (!this._userPassesRoleGate_(act))
            return false;

        // 4) Table ancestry: the current record's table must be the same as or extend the UI action's table
        var actionTable = (act.table + '').trim();
        if (actionTable && !this._tableAppliesToRecord_(actionTable, currentGR.getTableName()))
            return false;

        // 5) Evaluate the "condition" in the **UI Action's scope** with the correct globals
        // DEF0776025: If there is no condition on the UI Action record, the expectation is that it evaluates to true
        // The role gate should already handle the case where the user is not logged in and the condition is empty,
        // so at this point, we can assume that the user is either (a) logged in or (b) not logged in but the condition
        // is not empty. For (a) we can return true when the condition is empty. For (b) condition cannot be empty so
        // we continue on to evaluate it.
        if (act.condition.isNil()) return true;
        var evaluator = new GlideScopedEvaluator();

        // Provide the same variables that a UI Action condition expects
        evaluator.putVariable('current', currentGR); // required

        // IMPORTANT: evaluate against the UI Action record, field = 'condition'
        var result = evaluator.evaluateScript(act, 'condition');

        // UI Action conditions should yield a boolean; coerce safely
        return ('true' === ('' + result)) || (result === true);
    },
    /**
     * Emulates the platform role check for UI Actions:
     */
    _userPassesRoleGate_: function(act /* sys_ui_action GlideRecord */ ) {
        var actionRoleGr = new GlideRecord('sys_ui_action_role');
        actionRoleGr.addQuery('sys_ui_action', act.sys_id);
        actionRoleGr.query();

        // if no role records exist for this action → allow access
        if (!actionRoleGr.hasNext()) {
            var session = gs.getSession();
            // if no role records exist for this action → allow access if the user is logged in
            // if the user is not logged in, we still allow if condition is not empty
            return session.isLoggedIn() || act.getValue('condition');
        }

        while (actionRoleGr.next()) {
            if (gs.hasRole(actionRoleGr.sys_user_role.name)) {
                return true;
            }
        }
        return false;
    },

    /**
     * Verify that the current record's table is the same as, or extends from, the UI Action's table.
     * Uses TableUtils so we don't reinvent table hierarchy logic.
     *
     * @param {String} actionTable - UI Action table (e.g., 'problem', 'task', etc.)
     * @param {String} recordTable - current.getTableName()
     * @returns {Boolean}
     */
    _tableAppliesToRecord_: function(actionTable, recordTable) {
        if (!actionTable)
            return true; // global actions (no table specified)
        if (actionTable === recordTable)
            return true;

        try {
            var tu = new TableUtils(actionTable);
            var descendants = tu.getTables(); // includes the base table and all extended tables
            // In some releases, getTables() returns an array with the base first—just check membership
            for (var i = 0; i < descendants.length; i++) {
                if (descendants[i] === recordTable)
                    return true;
            }
        } catch (e) {
            // fail closed if hierarchy check cannot be determined
            return false;
        }
        return false;
    },

    type: 'ActionExecutionUtils'
};
