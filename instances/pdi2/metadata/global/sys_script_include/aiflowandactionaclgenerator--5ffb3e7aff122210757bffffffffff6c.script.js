var AIFlowAndActionACLGenerator = Class.create();
AIFlowAndActionACLGenerator.prototype = {
    initialize: function() {
        this.USER_IS_AUTHENTICATED = '239bdf0c47d23110ba46ff58936d4330';
        this.EXISTING = 'Existing';
        this.FLOW_TYPE = 'flow';
        this.ACTION_TYPE = 'flow_action';
        this.INVOKE_FROM_AI_OPERATION = 'invoke_from_ai';
    },

    /**
     * Creates an "allow to invoke" ACL for the given flow or action.
     *
     * This method is used to programmatically generate ACLs that allow flows or actions to be invoked,
     * typically as part of a fix script or system setup.
     *
     * ## Behavior
     * - If an ACL for the given name/type/operation already exists, it is reused.
     * - If no `roleIds` are provided, a security attribute is used to allow access:
     *   - If `attributeId` is provided, it must be a valid `sys_security_attribute` sys_id.
     *   - Otherwise, the default "UserIsAuthenticated" security attribute is used.
     * - If `roleIds` are provided, ACL roles are created to enforce access based on those roles.
     *
     * @param {string} flowOrActionScopedName - Required. Fully scoped name of the flow or action (e.g., `'x_snc_my_scope.my_flow'`).
     * @param {string} type - Required. Target type: `'flow'` or `'flow_action'`.
     * @param {Array<string>|Object} [arg3] - Either an array of role sys_ids, or an options object.
     * @param {string} [arg4] - Optional attributeId for legacy signature.
     *
     * @returns {string} The sys_id of the created or reused ACL record.
     *
     * @throws {Error} If the input arguments are invalid.
     * @throws {Error} If the security attribute sys_id is invalid.
     * @throws {Error} If the ACL or ACL role creation fails.
     * @throws {Error} If the user executing the script lacks permissions (requires `admin` or `maint` role).
     */
    createAllowInvokeAcl: function(flowOrActionScopedName, type, arg3, arg4) {
        if (this._nilString(flowOrActionScopedName)) {
            throw new Error('Invalid argument: "flowOrActionScopedName" must be a non-empty string.');
        }

        if (this._nilString(type)) {
            throw new Error('Invalid argument: "type" must be a non-empty string.');
        }

        if (!this._validType(type)) {
            throw new Error('Invalid argument: "type" must be either "flow" or "flow_action".');
        }

        var roleIds;
        var attribute;

        if (typeof arg3 === 'object' && !Array.isArray(arg3) && arg3 !== null) {
            // API: (name, type, { roleIds, defaultAttributeId })
            roleIds = this._arrayify(arg3.roleIds);
            attribute = this._resolveDefaultAttibute(arg3.attributeId);
        } else {
            // API: (name, type, roleIds?, defaultAttributeId?)
            roleIds = this._arrayify(arg3);
            attribute = this._resolveDefaultAttibute(arg4);
        }

        return this._createAllowInvokeAclForRolesWithName(
            flowOrActionScopedName,
            type,
            roleIds,
            attribute
        );
    },

    _createAllowInvokeAclForRolesWithName: function(flowOrActionScopedName, type, roleIds, attribute) {
        var insertedAclId = this._createAcl(flowOrActionScopedName, type);

        try {
            if (roleIds.length === 0) {
                gs.info('No roles given when creating ' + this.INVOKE_FROM_AI_OPERATION +
                    ' acl for ' + flowOrActionScopedName + ' with type ' + type + '. Adding "' + attribute.name + '" security attribute.');

                var createdAclRecord = new GlideRecordSecure('sys_security_acl');
                createdAclRecord.get(insertedAclId);
                createdAclRecord.setValue('local_or_existing', this.EXISTING);
                createdAclRecord.setValue('security_attribute', attribute.id);
                createdAclRecord.update();
            } else {
                for (var i = 0; i < roleIds.length; i++) {
                    this._createAclRole(flowOrActionScopedName, insertedAclId, roleIds[i]);
                }
            }

            return insertedAclId;
        } catch (error) {
            var acl = new GlideRecordSecure('sys_security_acl');
            if (acl.get(insertedAclId)) {
                acl.deleteRecord();
            }
            throw error;
        }
    },

    _createAcl: function(flowName, type) {
        var createdAclRecord = new GlideRecordSecure('sys_security_acl');
        createdAclRecord.addQuery('type', type);
        createdAclRecord.addQuery('name', flowName);
        createdAclRecord.addQuery('operation', this.INVOKE_FROM_AI_OPERATION);
        createdAclRecord.query();

        if (createdAclRecord.next()) {
            gs.debug('ACL for ' + flowName + ' already exists with sys_id ' + createdAclRecord.getUniqueValue() + '. Skipping ACL creation.');
            return createdAclRecord.getUniqueValue();
        }

        gs.debug('Attempting to insert new ' + this.INVOKE_FROM_AI_OPERATION + ' acl for ' + flowName + ' with type ' + type);

        createdAclRecord.initialize();
        createdAclRecord.setValue('type', type);
        createdAclRecord.setValue('name', flowName);
        createdAclRecord.setValue('operation', this.INVOKE_FROM_AI_OPERATION);

        var result = createdAclRecord.insert();
        if (!result) {
            throw new Error('Issue occurred while trying to create new ACL for ' + flowName);
        }

        gs.info('ACL successfully created for ' + flowName + ' with type ' + type + ' and operation ' + this.INVOKE_FROM_AI_OPERATION);
        return result;
    },

    _createAclRole: function(flowOrActionScopedName, aclId, roleId) {
        var roleRecord = new GlideRecordSecure('sys_security_acl_role');
        roleRecord.addQuery('sys_security_acl', aclId);
        roleRecord.addQuery('sys_user_role', roleId);
        roleRecord.query();

        if (roleRecord.next()) {
            gs.debug('ACL role for ' + flowOrActionScopedName + ' acl id ' + aclId + ' already exists for role id ' + roleId + '. Skipping ACL role creation.');
            return;
        }

        gs.debug('Attempting to insert new ACL role for ' + flowOrActionScopedName + ' acl id ' + aclId + ' and role id ' + roleId + '.');

        roleRecord.initialize();
        roleRecord.setValue('sys_security_acl', aclId);
        roleRecord.setValue('sys_user_role', roleId);

        var createdRoleAclId = roleRecord.insert();
        if (!createdRoleAclId) {
            throw new Error('Issue occurred while trying to create new role ACL for ' + flowOrActionScopedName + ' with role id ' + roleId);
        }

        gs.info('ACL role successfully created for ' + flowOrActionScopedName + ' acl id ' + aclId + ' for role id ' + roleId + '.');
    },

    _resolveDefaultAttibute: function(defaultAttributeId) {
        var resolvedAttributeId = defaultAttributeId;
        if (this._nilString(defaultAttributeId)) {
            resolvedAttributeId = this.USER_IS_AUTHENTICATED;
        }

        var securityAttribute = new GlideRecordSecure('sys_security_attribute');
        if (!securityAttribute.get(resolvedAttributeId)) {
            throw new Error('Invalid security attribute sys_id: ' + resolvedAttributeId);
        }

        return {
            id: securityAttribute.getUniqueValue(),
            name: securityAttribute.getValue('name')
        };
    },

    _arrayify: function(list) {
        return Array.isArray(list) ? list : [];
    },

    _nilString: function(str) {
        return typeof str !== 'string' || str.trim() === '';
    },

    _validType: function(type) {
        return type === this.FLOW_TYPE || type === this.ACTION_TYPE;
    },

    type: 'AIFlowAndActionACLGenerator'
};
