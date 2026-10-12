/**
 * IMPORTANT:
 * This script is specifically designed for use by Now Assist Skill Kit.
 * Any change here might cause disruption to user flows in the NASK app,
 * hence any change here should get reviewed and approved by NASK team (Assignment group: Dev-AI Studio).
 */

var GenAiSkillSecurityUtils = Class.create();
GenAiSkillSecurityUtils.prototype = {
    /**
     * Initializes the GenAiSkillSecurityUtils class.
     * Sets up constants for table names, ACL operations, ACL types, and security attributes.
     */
    initialize: function() {
        this.TABLES = {
            ACL: "sys_security_acl",
            ACL_ROLE: "sys_security_acl_role",
            USER_ROLE: "sys_user_role"
        };
        this.ACL_OPERATIONS = {
            EXECUTE: "execute"
        };

        this.ACL_TYPES = {
            SKILL: "0d986410ffdd2210c0e9ffffffffffc9", // acl.type="gen_ai_skill"
        };

        this.ACL_SECURITY_ATTRIBUTES = {
            USER_IS_AUTHENTICATED: "239bdf0c47d23110ba46ff58936d4330", // sys_id for sys_security_attribute with displayName "UserIsAuthenticated"
            ALLOW_ALWAYS: "9b3261650b170210f6146e1ef777b258" // sys_id for sys_security_attribute with displayName "Always"
        };

        this.INCLUDE_DEFAULT_ROLES_FOR_SKILL_ACL = (gs.getProperty("com.glide.one_extend.include_default_roles_for_skill_acl", false) || false) == "true";
    },

    /**
     * Retrieves the default roles for a skill ACL from system properties.
     * @private
     * @returns {string[]|null} An array of default role names, or null if not configured to include them.
     */
    _getDefaultRolesForSkillACL: function() {
        const DEFAULT_ROLES_FOR_SKILL_ACL = (gs.getProperty("com.glide.one_extend.default_roles_for_skill_acl", "") || "").split(",") || [];

        return this.INCLUDE_DEFAULT_ROLES_FOR_SKILL_ACL ? DEFAULT_ROLES_FOR_SKILL_ACL : null;
    },

    /**
     * Gets the list of roles that are always allowed to execute scripts, plus any additional roles from system properties.
     * @private
     * @returns {string[]} An array of allowed role names.
     */
    _getAllowedRolesForScript: function() {
        const ALWAYS_ALLOWED_ROLES = ["maint", "admin"];
        const ADDITIONAL_ALLOWED_ROLES = (gs.getProperty("com.glide.one_extend.roles_to_access_genaiskillsecurityutils_api", "") || "").split(",") || [];

        return [].concat(ALWAYS_ALLOWED_ROLES).concat(ADDITIONAL_ALLOWED_ROLES);
    },

    /**
     * Wraps the response in a standardized object structure.
     * @private
     * @param {*} [response=null] - The response payload.
     * @param {boolean} [error=false] - Flag indicating if an error occurred.
     * @param {string} [errorMessage=""] - The error message if an error occurred.
     * @returns {{response: *, error: boolean, errorMessage: string}} The wrapped response object.
     */
    _wrapResponseObject: function(response = null, error = false, errorMessage = "") {
        const wrappedResponse = {
            response,
            error,
            errorMessage
        };

        return wrappedResponse;
    },

    /**
     * Checks if the current user has the necessary roles to perform the operation.
     * @private
     * @returns {boolean} True if the user is allowed, false otherwise.
     */
    _isScriptOperationAllowed: function() {
        // Get all allowed roles
        const allowedRoles = this._getAllowedRolesForScript();

        // Check if user has any of the allowed roles
        for (let i = 0; i < allowedRoles.length; i++) {
            if (gs.hasRole(allowedRoles[i])) {
                return true;
            }
        }

        gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-_isScriptOperationAllowed: Not Allowed. User does not have the required role."));
        return false;
    },


    /**
     * Processes GlideRecord query results of user roles and converts them to a standardized array of objects.
     * @private
     * @param {GlideRecord} roleGr - The GlideRecord object containing user role records
     * @returns {Array<Object>} Array of user role objects with relevant properties
     */
    _processUserRoleRecords: function(roleGr) {
        var rolesList = [];
        while (roleGr.next()) {
            rolesList.push({
                sysId: roleGr.getValue("sys_id"),
                name: roleGr.getValue('name'),
                description: roleGr.getValue('description'),
                created: roleGr.getValue('sys_created_on'),
                createdBy: roleGr.getValue('sys_created_by'),
                updated: roleGr.getValue('sys_updated_on'),
                updatedBy: roleGr.getValue('sys_updated_by'),
                active: roleGr.getValue('active'),
                assignableBy: roleGr.getValue('assignable_by'),
                elevatedPrivilege: roleGr.getValue('elevated_privilege'),
                includesRoles: roleGr.getValue('includes_roles')
            });
        }
        return rolesList;
    },


    /**
     * Fetches user roles based on a search token, including exact and partial matches.
     * Prioritizes exact name matches before returning partial matches in name or description.
     * @param {string} [searchToken=""] - The search term to look for in role names and descriptions
     * @param {number} [limitForPartialMatches=20] - Maximum number of partial matches to return
     * @returns {{response: Array<Object>, error: boolean, errorMessage: string}} A wrapped response object containing the list of roles or an error
     * @throws {Error} If the user does not have the required role
     */
    fetchUserRolesBySearchToken: function(searchToken = "", limitForPartialMatches = 20) {
        if (!this._isScriptOperationAllowed()) {
            throw new Error(sn_i18n.Message.getMessage("sn_skill_builder", "Not allowed. User does not have the required role."));
        }
        var rolesList = [];

        try {
            var tableName = this.TABLES.USER_ROLE;

            // Query for exact name matches
            if (searchToken) {
                var grExact = new GlideRecord(tableName);
                grExact.addQuery("name", "=", searchToken);
                grExact.setLimit(1);
                grExact.query();
                var matchingGR = this._processUserRoleRecords(grExact);
                if (matchingGR.length > 0) {
                    rolesList = rolesList.concat(matchingGR);
                }
            }

            // Query for partial matches
            var grContains = new GlideRecord(tableName);
            if (searchToken) {
                grContains.addQuery("name", "!=", searchToken);
                grContains.addQuery("name", "CONTAINS", searchToken)
                    .addOrCondition("description", "CONTAINS", searchToken);
            }
            grContains.orderBy('name');
            grContains.setLimit(limitForPartialMatches);
            grContains.query();
            var partialMatches = this._processUserRoleRecords(grContains);
            rolesList = rolesList.concat(partialMatches);

            // Remove 'maint' from rolesList
            rolesList = rolesList.filter(role => role.name !== 'maint');

            // Check if no records were found
            if (searchToken && rolesList.length === 0) {
                return this._wrapResponseObject([], true, "No records found");
            }
        } catch (error) {
            return this._wrapResponseObject([], true, error.message);
        }

        return this._wrapResponseObject(rolesList);
    },

    /**
     * Fetches all user roles with relevant details for UI display.
     * @param {string} [encodedQuery=""] - An encoded query to filter the roles.
     * @param {number} [limit=100] - The maximum number of roles to return.
     * @param {string} [orderByDesc="sys_updated_on"] - The field to sort the results by in descending order.
     * @returns {{response: object[], error: boolean, errorMessage: string}} A wrapped response object containing the list of roles or an error.
     * @throws {Error} If the user does not have the required role.
     */
    fetchAllUserRoles: function(encodedQuery = "", limit = 100, orderBy = "name") {

        var rolesList = [];

        try {
            var roleGr = new GlideRecord(this.TABLES.USER_ROLE);
            if (encodedQuery) {
                roleGr.addEncodedQuery(encodedQuery);
            }

            if (orderBy) {
                roleGr.orderBy(orderBy);
            }

            limit = Number(limit || "");
            if (!isNaN(limit) && limit > 0) {
                roleGr.setLimit(limit);
            }

            roleGr.query();

            rolesList.push(
                ...this._processUserRoleRecords(roleGr)
            );
        } catch (error) {
            return this._wrapResponseObject([], true, error.message);
        }

        return this._wrapResponseObject(rolesList);
    },

    /**
     * Fetches all Skill ACLs for a given skill ID.
     * @param {string} skillId - The skill identifier contains the '<sys_id>' of the skill config record.
     * @param {string} [encodedQuery=""] - An encoded query to further filter the ACLs.
     * @param {number} [limit=10] - The maximum number of ACLs to return.
     * @param {string} [orderByDesc="sys_updated_on"] - The field to sort the results by in descending order.
     * @returns {{response: object[], error: boolean, errorMessage: string}} A wrapped response object containing the list of ACLs or an error.
     */
    getAllAclsForSkill: function(skillId, encodedQuery = "", limit = 10, orderByDesc = "sys_updated_on") {
        var aclList = [];

        try {
            var aclGr = new GlideRecord(this.TABLES.ACL);
            aclGr.addQuery('name', 'CONTAINS', skillId);
            aclGr.addQuery('type', this.ACL_TYPES.SKILL);
            aclGr.addQuery('operation', this.ACL_OPERATIONS.EXECUTE);
            aclGr.addActiveQuery();

            if (encodedQuery) {
                aclGr.addEncodedQuery(encodedQuery);
            }

            if (orderByDesc) {
                aclGr.orderByDesc(orderByDesc);
            }

            limit = Number(limit || "");
            if (!isNaN(limit) && limit > 0) {
                aclGr.setLimit(limit);
            }

            aclGr.query();

            while (aclGr.next()) {
                var aclObj = this._buildAclObject(aclGr);
                this._populateRolesForAcl(aclObj, aclGr.sys_id);
                aclList.push(aclObj);
            }

        } catch (error) {
            gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-getAllAclsForSkill: Error: {error}", {
                error: error.message
            }));
            return this._wrapResponseObject([], true, error.message);
        }
        return this._wrapResponseObject(aclList);
    },

    /**
     * Creates an 'execute' Skill ACL for a given skill internal name.
     * @param {string} [name] - The ACL name.
     * @param {string[]} [roles=[]] - An array of role names to associate with the ACL.
     * @param {boolean} [isDefault=false] - If true, sets the 'UserIsAuthenticated' security attribute.
     * @param {string} [description=""] - A description for the ACL. Only set if not empty.
     * @param {boolean} [allowDuplicateName=false] - If true, allows creation of multiple ACLs with the same name; otherwise, duplicate ACL names are not allowed.
     * @param {string} [securityAttributeId=""] - Optional security attribute sys_id or name to use instead of default UserIsAuthenticated when creating ACL.
     * @param {string} [scope=""] - Optional sys_id of the application scope to assign the ACL to. Must be a valid scope in the sys_scope table.
     * @returns {{response: {aclSysId: string}|null, error: boolean, errorMessage: string}} A wrapped response object containing the new ACL sys_id or an error.
     * @throws {Error} If the user does not have the required role, invalid parameters are provided, or scope validation fails.
     * @notes Security attributes are set with local_or_existing="Existing". Roles and security attributes can be used together (mutually inclusive).
     */
    insertSkillACLBySkillId: function(name, roles = [], isDefault = false, description = "", allowDuplicateName = false, securityAttributeId = "", scope = "") {
        if (!this._isScriptOperationAllowed()) {
            throw new Error(sn_i18n.Message.getMessage("global", "Not allowed. User does not have the required role."));
        }

        // Validate and trim name parameter
        name = name ? name.trim() : '';
        if (!name) {
            throw new Error(sn_i18n.Message.getMessage("global", "Invalid request params: ACL name cannot be empty or contain only spaces."));
        }

        // Validate roles parameter
        if (!Array.isArray(roles)) {
            throw new Error(sn_i18n.Message.getMessage("global", "Invalid request params: roles must be an array."));
        }

        // Validate security attributes if specified
        if (isDefault && !this._validateSecurityAttribute(this.ACL_SECURITY_ATTRIBUTES.USER_IS_AUTHENTICATED)) {
            throw new Error(sn_i18n.Message.getMessage("global", "Invalid security attribute: UserIsAuthenticated attribute not found in the system."));
        }

        // Validate the provided security attribute ID/name if specified
        let securityAttributeSysId = null;
        if (securityAttributeId) {
            // Check if it's a valid security attribute (either by ID or name)
            if (!this._validateSecurityAttribute(securityAttributeId)) {
                throw new Error(sn_i18n.Message.getMessage("global", "Invalid security attribute: '{0}' not found in the system.", [securityAttributeId]));
            }
            
            // Get the sys_id if it was provided as a name
            securityAttributeSysId = this._getSecurityAttributeSysId(securityAttributeId);
            if (!securityAttributeSysId) {
                throw new Error(sn_i18n.Message.getMessage("global", "Failed to retrieve security attribute sys_id for: '{0}'.", [securityAttributeId]));
            }
        }

        let aclSysId = null;

        try {
            let aclGr = new GlideRecord(this.TABLES.ACL);

            if (!allowDuplicateName && aclGr.get('name', name, 'operation', this.ACL_OPERATIONS.EXECUTE, 'type', this.ACL_TYPES.SKILL)) {
                throw new Error("ACL exists with same name and configuration. Please update the existing one using acl_sys_id.");
            }

            // Create new ACL record
            aclGr.initialize();
            aclGr.name = name;

            // Defaults
            aclGr.operation = this.ACL_OPERATIONS.EXECUTE;
            aclGr.type = this.ACL_TYPES.SKILL;
            // Only set description if it's not empty
            if (description && description.trim() !== '') {
                aclGr.description = description.trim();
            } else {
                aclGr.description = '';
            }
            aclGr.admin_overrides = true;
            aclGr.decision_type = "allow";
            aclGr.advanced = false;
            
            // Set scope if provided and validate it exists
            if (scope) {
                // Validate scope is a valid application
                var scopeGr = new GlideRecord('sys_scope');
                if (!scopeGr.get(scope)) {
                    throw new Error("Invalid scope: " + scope + ". The specified scope id does not exist.");
                }
                aclGr.sys_scope = scope;
            }

            if (isDefault) {
                aclGr.security_attribute = this.ACL_SECURITY_ATTRIBUTES.USER_IS_AUTHENTICATED;
                aclGr.local_or_existing = "Existing";
            } else if (securityAttributeSysId) {
                aclGr.security_attribute = securityAttributeSysId;
                aclGr.local_or_existing = "Existing";
            }

            aclSysId = aclGr.insert();

            if (!aclSysId) {
                throw new Error("Failed to create ACL record for the given name" + name);
            }

            gs.debug(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-insertSkillACLBySkillId: ACL created successfully with sys_id: {sys_id} and name: {name}", {
                sys_id: aclSysId,
                name: name
            }));

            // Associate roles regardless of isDefault status to support mutual inclusivity
            const globalThis = this;

            const roleIterator = [].concat(roles || []).concat(this._getDefaultRolesForSkillACL() || []);

            (roleIterator || []).forEach(function(roleName) {
                var roleGr = new GlideRecord(globalThis.TABLES.USER_ROLE);
                if (!roleGr.get('name', roleName)) {
                    // Cancel Insertion
                    throw new Error(sn_i18n.Message.getMessage("global", "Role {roleName} not found.", {
                        roleName: roleName
                    }));
                }
                var aclRoleGr = new GlideRecord(globalThis.TABLES.ACL_ROLE);
                aclRoleGr.initialize();
                aclRoleGr.sys_security_acl = aclSysId;
                aclRoleGr.sys_user_role = roleGr.sys_id;
                var aclRoleSysId = aclRoleGr.insert();

                if (!aclRoleSysId) {
                    // Cancel Insertion
                    throw new Error(sn_i18n.Message.getMessage("global", "Failed to associate role {roleName} to ACL with sys_id: {aclSysId} and name: {name}.", {
                        roleName: roleName,
                        aclSysId: aclSysId,
                        name: name
                    }));
                }

                gs.debug(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-insertSkillACLBySkillId: Associated role: {roleName} to ACL with sys_id: {aclSysId} and name: {name} successfully", {
                    roleName: roleName,
                    aclSysId: aclSysId,
                    name: name
                }));
            });

        } catch (error) {
            gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-insertSkillACLBySkillId: Failed for given ACL name: {name} due to error: {error}", {
                error: error.message,
                name: name
            }));


            try {
                // Try rolling back the created ACL
                let {
                    response: {
                        deleted = false,
                    } = {},
                    error: err = false,
                    errorMessage = ""
                } = this.deleteSkillAclByAclSysId(aclSysId);

                if (deleted) {
                    gs.debug(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-deleteSkillAclByAclSysId: Successfully rolled back ACL for given name: {name} due to error: {error}", {
                        error: error.message,
                        name: name
                    }));
                } else if (err) {
                    gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-deleteSkillAclByAclSysId: Failed to roll back ACL for given name: {name} due to error: {error}", {
                        error: err.message,
                        name: name
                    }));
                }
            } catch (err2) {
                gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-deleteSkillAclByAclSysId: Failed to roll back ACL for given name: {name} due to error: {err2}", {
                    err2: err2.message,
                    name: name
                }));
            }

            return this._wrapResponseObject(null, true, error.message);
        }

        return this._wrapResponseObject({
            aclSysId: aclSysId + ""
        });
    },

    /**
     * Updates an 'execute' Skill ACL for a given ACL sys_id.
     * @param {string} [aclSysId=""] - The sys_id of the ACL to update.
     * @param {string[]} [roles=[]] - An array of role names to associate with the ACL. Will replace existing roles.
     * @param {boolean} [isDefault=false] - If true, sets the 'UserIsAuthenticated' security attribute.
     * @param {string} [description=""] - An updated description for the ACL. Only updated if not empty and different from current value.
     * @param {string} [securityAttributeId=""] - Optional security attribute sys_id or name to use instead of default UserIsAuthenticated when updating ACL.
     * @returns {{response: {updated: boolean}|null, error: boolean, errorMessage: string}} A wrapped response object indicating success or an error.
     * @throws {Error} If the user does not have the required role, ACL type is not SKILL, operation is not EXECUTE, or attempting cross-scope editing.
     * @notes Security attributes are set with local_or_existing="Existing". Roles and security attributes can be used together (mutually inclusive). Cross-scope editing is prevented.
     */
    updateSkillAclByAclId: function(aclSysId = "", roles = [], isDefault = false, description = "", securityAttributeId = "") {
        var isUpdated = false;
        try {
            if (!this._isScriptOperationAllowed()) {
                throw new Error(sn_i18n.Message.getMessage("global", "Not allowed. User does not have the required role."));
            }
            
            let aclGr = new GlideRecord(this.TABLES.ACL);
            // Validate ACL sys_id parameter
            if (!aclSysId) {
                throw new Error(sn_i18n.Message.getMessage("global", "Invalid request params: ACL sys_id is required."));
            }

            // Ensure roles is always an array
            if (!Array.isArray(roles)) {
                throw new Error(sn_i18n.Message.getMessage("global", "Invalid request params: roles must be an array."));
            }

            // Validate security attributes if specified
            if (isDefault && !this._validateSecurityAttribute(this.ACL_SECURITY_ATTRIBUTES.USER_IS_AUTHENTICATED)) {
                throw new Error("Invalid security attribute: UserIsAuthenticated attribute not found in the system.");
            }

            // Validate the provided security attribute ID/name if specified
            let securityAttributeSysId = null;
            if (securityAttributeId) {
                // Check if it's a valid security attribute (either by ID or name)
                if (!this._validateSecurityAttribute(securityAttributeId)) {
                    throw new Error("Invalid security attribute: '" + securityAttributeId + "' not found in the system.");
                }
                
                // Get the sys_id if it was provided as a name
                securityAttributeSysId = this._getSecurityAttributeSysId(securityAttributeId);
                if (!securityAttributeSysId) {
                    throw new Error("Failed to retrieve security attribute sys_id for: '" + securityAttributeId + "'.");
                }
            }
            
            // Validate ACL exists
            if (!aclGr.get(aclSysId)) {
                // Cancel update
                throw new Error("No ACL found for the given sys_id: " + aclSysId);
            }
            
            // Validate that the ACL is of the correct type and operation
            if (aclGr.getValue('type') != this.ACL_TYPES.SKILL || aclGr.getValue('operation') != this.ACL_OPERATIONS.EXECUTE) {
                throw new Error("This method can only update ACLs with type=GEN_AI_SKILL and operation=EXECUTE. Found type=" + (aclGr.type || {}).getDisplayValue() + ", operation=" + aclGr.getValue('operation'));
            }
            
            // Prevent cross-scope editing
            var currentScope = gs.getCurrentApplicationId();
            var aclScope = aclGr.getValue('sys_scope');
            
            if (currentScope && aclScope && currentScope !== aclScope) {
                // Get scope names for better error messaging
                var currentScopeName = this._getScopeNameById(currentScope) || 'Unknown';
                var aclScopeName = this._getScopeNameById(aclScope) || 'Unknown';
                
                throw new Error("Cross-scope editing not allowed. Current scope '" + currentScopeName + "' (" + currentScope + ") does not match ACL scope '" + aclScopeName + "' (" + aclScope + ").");
            }

            // Update existing ACL
            // Only update description if it's not empty and different from current value
            if (description && description.trim() !== '' && description !== aclGr.getValue('description')) {
                aclGr.description = description.trim();
            }
            
            if (isDefault) {
                aclGr.security_attribute = this.ACL_SECURITY_ATTRIBUTES.USER_IS_AUTHENTICATED;
                aclGr.local_or_existing = "Existing";
            } else if (securityAttributeSysId) {
                aclGr.security_attribute = securityAttributeSysId;
                aclGr.local_or_existing = "Existing";
            } else {
                // Explicitly remove security attribute if isDefault is false and no securityAttributeId is provided
                aclGr.security_attribute = "";
                aclGr.local_or_existing = "";
            }
            
            // Force the update to go through
            aclGr.setForceUpdate(true);
            isUpdated = aclGr.update();

            // Verify update was successful
            if (!isUpdated) {
                // Cancel update
                throw new Error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-updateSkillAclByAclId: ACL update was unsuccessful with sys_id: {sys_id}", {
                    sys_id: aclGr.sys_id
                }));
            }
            gs.debug(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-updateSkillAclByAclId: ACL updated successfully with sys_id: {sys_id}", {
                sys_id: aclGr.sys_id
            }));

            // Associate roles to ACL (remove existing associations first)

            var existingAclRolesGr = new GlideRecord(this.TABLES.ACL_ROLE);
            existingAclRolesGr.addQuery(this.TABLES.ACL, aclSysId);
            existingAclRolesGr.deleteMultiple();

            // Associate roles regardless of isDefault status to support mutual inclusivity
            const globalThis = this;

            const roleIterator = [].concat(roles || []).concat(this._getDefaultRolesForSkillACL() || []);

            (roleIterator || []).forEach(function(roleName) {
                var roleGr = new GlideRecord(globalThis.TABLES.USER_ROLE);
                if (roleGr.get('name', roleName)) {
                    var aclRoleGr = new GlideRecord(globalThis.TABLES.ACL_ROLE);
                    aclRoleGr.initialize();
                    aclRoleGr.sys_security_acl = aclSysId;
                    aclRoleGr.sys_user_role = roleGr.sys_id;
                    var aclRoleSysId = aclRoleGr.insert();
                    if (aclRoleSysId) {
                        gs.debug(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-updateSkillAclByAclId: Associated role: {roleName} to ACL successfully", {
                            roleName: roleName
                        }));
                    } else {
                        gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-updateSkillAclByAclId: Failed to associate role {roleName} to ACL.", {
                            roleName: roleName
                        }));
                    }

                } else {
                    gs.warn(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-updateSkillAclByAclId: Role {roleName} not found. Skipping association.", {
                        roleName: roleName
                    }));
                }
            });

        } catch (error) {
            gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-updateSkillAclByAclId: Error: {error}", {
                error: error.message
            }));
            return this._wrapResponseObject(null, true, error.message);
        }

        return this._wrapResponseObject({
            updated: isUpdated
        });

    },

    /**
     * Deletes active skill ACL(s) based on an encoded query.
     * @param {string} encodedQuery - The encoded query to find ACLs to delete.
     * @returns {{response: {deleted: boolean}|null, error: boolean, errorMessage: string}} A wrapped response object indicating success or an error.
     * @throws {Error} If the user does not have the required role.
     */
    deleteSkillAclByEncodedQuery: function(encodedQuery) {
        if (!this._isScriptOperationAllowed()) {
            throw new Error(sn_i18n.Message.getMessage("global", "User does not have the required role."));
        }

        let deleted = true;
        try {
            if (!encodedQuery) {
                throw new Error("Invalid request params.");
            }

            const aclGr = new GlideRecord(this.TABLES.ACL);
            aclGr.addQuery('type', this.ACL_TYPES.SKILL);
            aclGr.addQuery('operation', this.ACL_OPERATIONS.EXECUTE);
            aclGr.addActiveQuery();
            aclGr.addEncodedQuery(encodedQuery);
            aclGr.deleteMultiple();

            gs.debug(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-deleteSkillAclByEncodedQuery: ACL(s) deleted successfully for query: {encodedQuery}", {
                encodedQuery: encodedQuery
            }));

        } catch (error) {
            gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-deleteSkillAclByEncodedQuery: Failed to delete for the given query: {encodedQuery} due to Error: {error}", {
                error: error.message,
                encodedQuery
            }));
            return this._wrapResponseObject(null, true, error.message);
        }
        return this._wrapResponseObject({
            deleted
        });
    },

    /**
     * Deletes an active Skill ACL for a given ACL sys_id.
     * @param {string} [aclSysId=""] - The sys_id of the ACL to delete.
     * @returns {{response: {deleted: boolean, aclSysId: string}|null, error: boolean, errorMessage: string}} A wrapped response object indicating success or an error.
     * @throws {Error} If the user does not have the required role.
     */
    deleteSkillAclByAclSysId: function(aclSysId = "") {
        if (!this._isScriptOperationAllowed()) {
            throw new Error(sn_i18n.Message.getMessage("global", "User does not have the required role."));
        }

        try {
            if (!aclSysId) {
                throw new Error("Invalid request params.");
            }
            const aclGr = new GlideRecord(this.TABLES.ACL);

            if (aclGr.get(aclSysId)) {
                if (aclGr.getValue("active") == "1" || aclGr.getValue("active") == "true") {
                    aclGr.deleteRecord(aclSysId);
                    gs.debug(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-deleteSkillAclByAclSysId: ACL deleted successfully for aclSysId: {aclSysId}", {
                        aclSysId: aclSysId
                    }));
                    return this._wrapResponseObject({
                        deleted: true,
                        aclSysId: aclSysId
                    });
                } else {
                    const errorMsg = "ACL record exists but is not active";
                    gs.warn(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-deleteSkillAclByAclSysId: {errorMsg} for aclSysId: {aclSysId}", {
                        errorMsg: errorMsg,
                        aclSysId: aclSysId
                    }));
                    return this._wrapResponseObject({
                        deleted: false,
                        aclSysId: aclSysId
                    }, true, errorMsg);
                }
            } else {
                const errorMsg = "No ACL record found for the provided sys_id";
                gs.warn(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-deleteSkillAclByAclSysId: {errorMsg}: {aclSysId}", {
                    errorMsg: errorMsg,
                    aclSysId: aclSysId
                }));
                return this._wrapResponseObject({
                    deleted: false,
                    aclSysId: aclSysId
                }, true, errorMsg);
            }
        } catch (error) {
            gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-deleteSkillAclByAclSysId: Delete for failed for aclSysId: {aclSysId} due to Error: {error}", {
                error: error.message,
                aclSysId: aclSysId
            }));
            return this._wrapResponseObject(null, true, error.message);
        }
    },

    /**
     * Gets an ACL by its sys_id with detailed information.
     * @param {string} aclSysId - The sys_id of the ACL to retrieve.
     * @returns {{response: object|null, error: boolean, errorMessage: string}} A wrapped response object containing the ACL details or an error.
     */
    getAclById: function(aclSysId) {
        try {
            if (!aclSysId) {
                throw new Error("ACL sys_id is required.");
            }
            
            var aclGr = new GlideRecord(this.TABLES.ACL);
            if (!aclGr.get(aclSysId)) {
                return this._wrapResponseObject(null, true, "No ACL found with the provided sys_id.");
            }
            
            var aclObj = this._buildAclObject(aclGr);
            this._populateRolesForAcl(aclObj, aclGr.sys_id);
            
            return this._wrapResponseObject(aclObj);
        } catch (error) {
            gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-getAclById: Error: {error}", {
                error: error.message
            }));
            return this._wrapResponseObject(null, true, error.message);
        }
    },

    /**
     * Determines if the current user has access to the specified resource path.
     * @param {string} resourcePath - The resource path to check.
     * @param {object|null} context - Optional context for the access check.
     * @returns {{response: boolean, error: boolean, errorMessage: string}} Result object indicating access and errors.
     */
    hasAccessToResource: function(resourcePath, context = null) {
        try {
            if (!resourcePath) {
                throw new Error("Resource path is required.");
            }

            var hasAccess = GlideSecurityManager.get().hasRightsTo(resourcePath, context);
            var userName = gs.getUserName();

            if (hasAccess) {
                gs.debug(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-hasAccessToResource: Access granted for user {userName} to resource path {resourcePath}.", {
                    userName: userName,
                    resourcePath: resourcePath
                }));
            } else {
                gs.debug(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-hasAccessToResource: Access denied for user {userName} to resource path {resourcePath}.", {
                    userName: userName,
                    resourcePath: resourcePath
                }));
            }
            return this._wrapResponseObject(hasAccess);
        } catch (error) {
            gs.error(sn_i18n.Message.getMessage("global", "GenAiSkillSecurityUtils-hasAccessToResource: Error checking access for user {userName} to resource path {resourcePath}. Error: {error}", {
                userName: gs.getUserName(),
                resourcePath: resourcePath,
                error: error.message
            }));
            return this._wrapResponseObject(false, true, error.message);
        }
    },

    /**
     * Validates that a security attribute exists in the sys_security_attribute table
     * @param {string} attributeIdOrName - The sys_id or display value of the security attribute to validate
     * @returns {boolean} True if the security attribute exists, false otherwise
     * @private
     */
    _validateSecurityAttribute: function(attributeIdOrName) {
        if (!attributeIdOrName) {
            return false;
        }

        var secAttrGr = new GlideRecord('sys_security_attribute');
        
        // First try to get by sys_id (more efficient)
        if (secAttrGr.get("sys_id", attributeIdOrName)) {
            return true;
        }
        
        // If not found by sys_id, try by display value
        secAttrGr = new GlideRecord('sys_security_attribute');
        secAttrGr.addQuery('name', attributeIdOrName);
        secAttrGr.query();
        return secAttrGr.hasNext();
    },

    /**
     * Helper method to build an ACL object from a GlideRecord
     * @param {GlideRecord} aclGr - The ACL GlideRecord to extract data from
     * @returns {Object} A standardized ACL object with all required properties
     */
    _buildAclObject: function(aclGr) {
        return {
            name: aclGr.getValue('name'),
            active: aclGr.getValue('active'),
            description: aclGr.getValue('description'),
            created: aclGr.getValue('sys_created_on'),
            createdBy: aclGr.getValue('sys_created_by'),
            updated: aclGr.getValue('sys_updated_on'),
            updatedBy: aclGr.getValue('sys_updated_by'),
            isAdvanced: aclGr.getValue('advanced'),
            securityAttribute: (aclGr.security_attribute || {}).getDisplayValue() || "",
            securityAttributeId: aclGr.getValue('security_attribute') || "",
            id: aclGr.getValue('sys_id'),
            adminOverrides: aclGr.getValue('admin_overrides'),
            protectionPolicy: aclGr.getValue('sys_policy'),
            decisionType: aclGr.getValue('decision_type'),
            scope: aclGr.getValue('sys_scope'),
            package: (aclGr.sys_package || {}).getDisplayValue() || "",
            application: (aclGr.sys_scope || {}).getDisplayValue() || "",
            script: aclGr.getValue('script') || "",
            operation: aclGr.getValue('operation'),
            type: (aclGr.type || {}).getDisplayValue() || "",
            roles: [],
            rolesObject: []
        };
    },
    
    /**
     * Populates roles for an ACL object
     * @param {Object} aclObj - The ACL object to populate roles for
     * @param {String} aclId - The sys_id of the ACL record
     * @returns {Object} The same ACL object with roles populated
     */
    _populateRolesForAcl: function(aclObj, aclId) {
        var aclRoleGr = new GlideRecord(this.TABLES.ACL_ROLE);
        aclRoleGr.addQuery(this.TABLES.ACL, aclId);
        aclRoleGr.query();
        
        while (aclRoleGr.next()) {
            var roleGr = new GlideRecord(this.TABLES.USER_ROLE);
            if (roleGr.get(aclRoleGr.sys_user_role)) {
                aclObj.roles.push(roleGr.getValue('name'));
                aclObj.rolesObject.push({
                    sysId : roleGr.getValue('sys_id'),
                    name : roleGr.getValue('name'),
                    description : roleGr.getValue('description')
                });
            }
        }
        
        return aclObj;
    },
    
    /**
     * Helper method to get scope name by its sys_id
     * @param {String} scopeId - The sys_id of the scope to look up
     * @returns {String} The display name of the scope, or null if not found
     * @private
     */
    _getScopeNameById: function(scopeId) {
        if (!scopeId) {
            return null;
        }
        
        var scopeGr = new GlideRecord('sys_scope');
        if (scopeGr.get(scopeId)) {
            return scopeGr.getValue('name');
        }
        return null;
    },
    
    /**
     * Helper method to get security attribute sys_id by name or ID
     * @param {String} securityAttributeInput - The security attribute name or sys_id to resolve
     * @returns {String} The sys_id of the security attribute, or null if not found
     * @private
     */
    _getSecurityAttributeSysId: function(securityAttributeInput) {
        if (!securityAttributeInput) {
            return null;
        }
        
        // First try as sys_id
        var securityAttributeGr = new GlideRecord('sys_security_attribute');
        if (securityAttributeGr.get("sys_id", securityAttributeInput)) {
            return securityAttributeInput; // It was already a sys_id
        }
        
        // Try by name
        securityAttributeGr = new GlideRecord('sys_security_attribute');
        securityAttributeGr.addQuery('name', securityAttributeInput);
        securityAttributeGr.query();
        if (securityAttributeGr.next()) {
            return securityAttributeGr.getValue('sys_id');
        }
        
        return null;
    },

    type: 'GenAiSkillSecurityUtils'
};
