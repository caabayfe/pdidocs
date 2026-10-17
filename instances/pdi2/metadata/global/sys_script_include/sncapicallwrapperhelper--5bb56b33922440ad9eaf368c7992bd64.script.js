/**
 * KittyScript-safe wrapper for SNCAPICallWrapper
 * DEF0815575 - DIRS0000416 (Brazil) KittyScript Compatibility
 *
 * Security attribute scripts cannot use:
 * - 'new' keyword
 * - assignment operators (answer=)
 *
 * This helper provides static methods that can be called directly
 * from security attributes without instantiation.
 */
var SNCAPICallWrapperHelper = Class.create();
SNCAPICallWrapperHelper.prototype = {
    initialize: function() {
    },
    type: 'SNCAPICallWrapperHelper'
};

/**
 * Check if user has rights to conditional table query range
 * Static method - can be called without 'new' keyword
 *
 * @param tableName {string} Table name to check rights for
 * @return {boolean} True if user has rights
 */
SNCAPICallWrapperHelper.hasRightsToConditionalTableQueryRange = function(tableName) {
    return new global.SNCAPICallWrapper().hasRightsToConditionalTableQueryRange(tableName);
};

/**
 * Check if current user is impersonating
 * Static method - can be called without 'new' keyword
 *
 * @return {boolean} True if impersonating
 */
SNCAPICallWrapperHelper.isImpersonating = function() {
    return new global.SNCAPICallWrapper().isImpersonating();
};

/**
 * Check if current user has any roles
 * Static method - can be called without 'new' keyword
 *
 * @return {boolean} True if user has roles
 */
SNCAPICallWrapperHelper.gsGetUserHasRoles = function() {
    return new global.SNCAPICallWrapper().gsGetUserHasRoles();
};

/**
 * Check if current user has specific role
 * Static method - can be called without 'new' keyword
 *
 * @param roleName {string} Role name to check
 * @return {boolean} True if user has role
 */
SNCAPICallWrapperHelper.gsHasRole = function(roleName) {
    return new global.SNCAPICallWrapper().gsHasRole(roleName);
};

/**
 * Check if current user has specific role (via gs.getUser())
 * Static method - can be called without 'new' keyword
 *
 * @param roleName {string} Role name to check
 * @return {boolean} True if user has role
 */
SNCAPICallWrapperHelper.gsGetUserHasRole = function(roleName) {
    return new global.SNCAPICallWrapper().gsGetUserHasRole(roleName);
};

/**
 * Get size of user's roles
 * Static method - can be called without 'new' keyword
 *
 * @return {number} Number of roles user has
 */
SNCAPICallWrapperHelper.gsGetUserGetRolesSize = function() {
    return new global.SNCAPICallWrapper().gsGetUserGetRolesSize();
};
