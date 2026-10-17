var QueryGenGlobalAccessUtil = Class.create();
QueryGenGlobalAccessUtil.prototype = {
    initialize: function() {
        this._grCache = {};
    },

    /**
     * Fast path to check if the current user has some access rights to the table,
     * and therefore the table can sent to the AI model in a prompt. Utilizes a
     * request-level cache to avoid repeatedly creating new GlideRecordSecure instances
     * for the same table.
     *
     * See `QueryGenGlobalAccessUtil.canUseTableInPrompt()` method docs for details.
     *
     * @param {string} tableName
     * @returns {boolean}
     */
    canUseTableInPrompt: function(tableName) {
        if (!QueryGenGlobalAccessUtil.isValidTable(tableName)) return false;
        if (!this._grCache[tableName]) {
            this._grCache[tableName] = new GlideRecordSecure(tableName);
        }
        return QueryGenGlobalAccessUtil.canUseTableInPrompt(
            tableName,
            this._grCache[tableName]
        );
    },

    /**
     * Fast path to check if the current user has some access rights to the field,
     * and therefore the field can sent to the AI model in a prompt. Utilizes a
     * request-level cache to avoid repeatedly creating new GlideRecordSecure instances
     * for the same table.
     *
     * See `QueryGenGlobalAccessUtil.canUseFieldInPrompt()` method docs for details.
     *
     * @param {string} tableName
     * @param {string} fieldName
     * @returns {boolean}
     */
    canUseFieldInPrompt: function(tableName, fieldName) {
        if (!QueryGenGlobalAccessUtil.isValidTable(tableName)) return false;
        if (!this._grCache[tableName]) {
            this._grCache[tableName] = new GlideRecordSecure(tableName);
        }
        return QueryGenGlobalAccessUtil.canUseFieldInPrompt(
            tableName,
            fieldName,
            this._grCache[tableName]
        );
    },

    type: "QueryGenGlobalAccessUtil"
};

// Static property to hold the singleton instance
QueryGenGlobalAccessUtil._instance = null;

/**
 * Gets the singleton instance of QueryGenGlobalAccessUtil.
 * Creates the instance on first call and returns the same instance on subsequent calls.
 *
 * @static
 * @returns {QueryGenGlobalAccessUtil}
 */
QueryGenGlobalAccessUtil.get = function() {
    if (!QueryGenGlobalAccessUtil._instance) {
        QueryGenGlobalAccessUtil._instance = new QueryGenGlobalAccessUtil();
    }
    return QueryGenGlobalAccessUtil._instance;
};

/**
 * Fast path check to determine if the specified table exists.
 *
 * @static
 * @param {string} tableName
 * @returns {boolean}
 */
QueryGenGlobalAccessUtil.isValidTable = function(tableName) {
    return GlideTableDescriptor.isValid(tableName);
};

/**
 * Fast path check to determine if the specified table exists and the specified
 * field is defined on the table. Returns true for all valid fields, including
 * those defined directly on a table or inherited from a parent table.
 *
 * @static
 * @param {string} tableName
 * @param {string} fieldName
 * @returns {boolean}
 */
QueryGenGlobalAccessUtil.isValidField = function(tableName, fieldName) {
    return (
        QueryGenGlobalAccessUtil.isValidTable(tableName) &&
        GlideTableDescriptor.fieldExists(tableName, fieldName)
    );
};

/**
 * Fast path to check if the current user has some access rights to the table.
 *
 * Do use this check: To determine if the table can be sent as an option for
 * the AI model to use when generating a query.
 *
 * Do NOT use this check: To determine if the user can actually query the table,
 * or view raw or aggregated data from the table. You should use some data
 * fetching API that implements full ACL checks to retrieve data for the table
 * (e.g. GlideRecordSecure, PA Aggregate API, etc.).
 *
 * This means some queries using the table may fail to execute, but that will
 * be relatively rare because "read" ACLs are usually the basis for granting
 * "report_view" and other ACLs.
 *
 * Currently checks if the user has "read" ACL rights to the table but this
 * is an internal implementation detail and may change in the future.
 *
 * @static
 * @param {string} tableName
 * @param {GlideRecordSecure} [gr] - Optional, pass an already constructed GlideRecordSecure
 *  instance for the table if you have one to avoid paying for a new instance.
 *  If nothing is passed a new GlideRecordSecure instance will be created. You do not
 *  need to initialize() the instance before passing it in, initialize() is
 *  expensive and not necessary for this check.
 * @returns {boolean}
 */
QueryGenGlobalAccessUtil.canUseTableInPrompt = function(tableName, gr) {
    if (!gr) {
        if (!QueryGenGlobalAccessUtil.isValidTable(tableName)) return false;
        gr = new GlideRecordSecure(tableName);
    }
    return GlideSecurityManager.tableLevelACLAllow(gr, "read");
};

/**
 * Fast path check to determine if the current user has some access rights to
 * the specified field.
 *
 * Do use this check: To determine if the field can be sent as an option for
 * the AI model to use when generating a query.
 *
 * Do NOT use this check: To determine if the user can actually view raw or
 * aggregated data for the field, or use the field in an encoded query
 * condition. You should use some data fetching API that implements full ACL
 * checks to retrieve data (e.g. GlideRecordSecure, PA Aggregate API, etc.).
 *
 * This means some queries using the field may fail to execute, but that will
 * be relatively rare because "read" ACLs are usually the basis for granting
 * "query_range", "query_match", and "report_view", and other ACLs.
 *
 * Currently checks if the user has "read" ACL rights to the field but this
 * is an internal implementation detail and may change in the future.
 *
 * @static
 * @param {string} tableName
 * @param {string} fieldName
 * @param {GlideRecordSecure} [gr] - Optional, pass an already constructed GlideRecordSecure
 *  instance for the table if you have one to avoid paying for a new instance.
 *  You do not need to initialize() the instance, initialize() is expensive and
 *  not necessary for this check. If nothing is passed a new GlideRecordSecure instance
 *  will be created.
 * @returns {boolean}
 */
QueryGenGlobalAccessUtil.canUseFieldInPrompt = function(
    tableName,
    fieldName,
    gr
) {
    if (!gr) {
        if (!QueryGenGlobalAccessUtil.isValidTable(tableName)) return false;
        gr = new GlideRecordSecure(tableName);
    }
    var target = "record/" + tableName + "." + fieldName + "/read";
    // Pass null (not gr) — context is not required for table-level validation per
    // GlideSecurityManager docs. Passing an empty GlideRecord causes data conditions
    // to evaluate against null fields, incorrectly blocking users who have role-based access.
    return GlideSecurityManager.get().hasRightsTo(target, null);
};
