/**
 * @class EFActionUtils
 * @classdesc Utility class for Error Framework action operations
 *
 * DEF0621351 requires this to be ES5 until fixed and remove EFConstants and EFLogger references to avoid
 * needing to refactor those to ES5 as well
 */
var EFActionUtils = Class.create();
EFActionUtils.prototype = {
    initialize: function() {},

    /**
     * Gets a GlideRecord for a table based on a field/value pair
     * @param {string} table - The table to query
     * @param {string} field - The field to query on
     * @param {string} value - The value to query for
     * @returns {GlideRecord|null} The found record or null
     */
    getTableRecordGr: function(table, field, value) {
        var actionGr = new GlideRecordSecure(table);
        actionGr.addQuery(field, value);
        actionGr.query();
        return actionGr.hasNext() ? actionGr : null;
    },

    /**
     * Gets the error context from an error record
     * @param {string} errorSysId - The sys_id of the error record
     * @returns {Object|undefined} The parsed context object or undefined
     */
    getErrorContext: function(errorSysId) {
        var errorGr = new GlideRecord('sys_error');
        if (errorGr.get('sys_id', errorSysId)) {
            try {
                var context = JSON.parse(errorGr.getValue('context'));
                return context;
            } catch (e) {
                // Handle parse error if needed
            }
        }
    },

    /**
     * Fetches input parameters from a table
     * @param {string} table - The table to query
     * @param {string} field - The field to query on
     * @param {string} sys_id - The sys_id value to query for
     * @returns {Array} Array of input parameters
     */
    fetchInputs: function(table, field, sys_id) {
        var inputParams = [];
        var inputsGr = new GlideRecordSecure(table);
        inputsGr.addQuery(field, sys_id);
        inputsGr.query();

        while (inputsGr.next()) {
            inputParams.push(inputsGr.element + '');
        }

        return inputParams;
    },

    /**
     * Gets the current instance URL
     * @returns {string} The instance URL
     */
    getInstanceURL: function() {
        var url = gs.getProperty('glide.servlet.uri');
        return url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
    },

    /**
     * Extracts path parameters from a URI template
     * @param {string} operationUri - The URI template containing parameters
     * @returns {Array} Array of parameter names
     */
    extractPathParams: function(operationUri) {
        // Regular expression to match {param} patterns
        var regex = /{([^}]*)}/g;
        var matches = [];
        var match;

        // Find all matches using regex
        while ((match = regex.exec(operationUri)) !== null) {
            matches.push(match[1]); // match[1] contains the parameter name without braces
        }

        return matches;
    },

    /**
     * Replaces path parameters in a URI with values
     * @param {string} uri - The URI template
     * @param {Object} params - Object containing parameter values
     * @returns {string} URI with replaced parameter values
     */
    replacePathParams: function(uri, params) {
        return uri.replace(/{([^}]*)}/g, function(match, paramName) {
            return encodeURIComponent(params[paramName] || '');
        });
    },

    /**
     * Fetches actions associated with an error code
     * @param {string} errorCode - The error code to query for
     * @returns {Array} Array of action objects, each containing sys_id, name, and type
     */
    getActions: function(errorCode) {
        if (!errorCode) {
            return;
        }

        var m2mGr = new GlideRecordSecure('sys_error_code_to_action_m2m');
        var encodedQuery = 'error_code=' + errorCode + '^ORerror_codeISEMPTY^action.active=true';
        m2mGr.addEncodedQuery(encodedQuery);
        m2mGr.query();

        var actions = [];
        while (m2mGr.next()) {
            var actionObj = {
                sys_id: m2mGr.action.sys_id.toString(),
                name: m2mGr.action.name.toString(),
                type: m2mGr.action.type.toString(),
                message: m2mGr.action.message.toString(),
                input: m2mGr.action.input.toString()
            };

            actions.push(actionObj);
        }
        return actions;
    },

    /**
     * Checks whether an action is applicable to a given error code via the M2M table.
     * An action is applicable if it is directly mapped to the error code, or mapped globally
     * (error_code is empty) and the action is active.
     * @param {string} actionSysId - The sys_id of the action
     * @param {string} errorCodeSysId - The sys_id of the error code
     * @returns {boolean} True if the action is applicable to the error code
     */
    isActionApplicable: function(actionSysId, errorCodeSysId) {
        var m2mGr = new GlideRecord(EFConstants.TABLES.ERROR_ACTIONS_M2M);
        m2mGr.addQuery('action', actionSysId);
        m2mGr.addQuery('action.active', true);
        var codeCondition = m2mGr.addQuery('error_code', errorCodeSysId);
        codeCondition.addOrCondition('error_code', 'ISEMPTY', '');
        m2mGr.setLimit(1);
        m2mGr.query();
        return m2mGr.hasNext();
    },

    /**
     * Gets source applications accessible by the current user based on their roles
     * @returns {Array} Array of source application sys_ids
     */
    getSourceApplicationByUserRoles: function() {
        if (gs.hasRole('maint')) {
            return this.getAllSourceApps();
        }

        var appRolesMap = this.buildSourceAppRolesMap();
        var accessibleSourceApps = [];

        var hasFrameworkAccess = gs.hasRole('error_framework.admin') || gs.hasRole('error_framework.operator');

        for (var sysId in appRolesMap) {
            var appInfo = appRolesMap[sysId];

            var hasAppRoleAccess = (appInfo.adminRole && this.userHasRole(appInfo.adminRole)) ||
                (appInfo.operatorRole && this.userHasRole(appInfo.operatorRole));

            if (hasFrameworkAccess && hasAppRoleAccess) {
                accessibleSourceApps.push(sysId);
            }
        }
        return accessibleSourceApps;
    },

    /**
     * Builds a dictionary of source applications and their roles
     * @returns {Object} Dictionary with sys_id as key and role information as values
     */
    buildSourceAppRolesMap: function() {
        var appRolesMap = {};

        var sourceAppGr = new GlideRecord('sys_error_appl');
        sourceAppGr.query();

        while (sourceAppGr.next()) {
            var appSysId = sourceAppGr.getUniqueValue();
            appRolesMap[appSysId] = {
                adminRole: !gs.nil(sourceAppGr.application_admin_role) ? sourceAppGr.application_admin_role.getDisplayValue() : null,
                operatorRole: !gs.nil(sourceAppGr.application_operator_role) ? sourceAppGr.application_operator_role.getDisplayValue() : null,
                name: sourceAppGr.getValue('source_application')
            };
        }

        return appRolesMap;
    },

    /**
     * Gets all source applications sys_ids
     * @returns {Array} Array of source application sys_ids
     */
    getAllSourceApps: function() {
        var allApps = [];
        var allAppsGr = new GlideRecord('sys_error_appl');
        allAppsGr.query();

        while (allAppsGr.next()) {
            allApps.push(allAppsGr.getUniqueValue());
        }

        return allApps;
    },

    /**
     * Checks whether the current user has an active assignment for the role name provided.
     * @param {String} roleName Name of the role to validate
     * @returns {Boolean} True when the current user has the active role assignment
     */
    userHasRole: function(roleName) {
        if (!roleName)
            return false;

        var gr = new GlideRecord('sys_user_has_role');
        gr.addQuery('user', gs.getUserID());
        gr.addQuery('role.name', roleName);
        gr.addQuery('state', 'active');
        gr.setLimit(1);
        gr.query();

        return gr.hasNext();
    },

    type: 'EFActionUtils'
};
