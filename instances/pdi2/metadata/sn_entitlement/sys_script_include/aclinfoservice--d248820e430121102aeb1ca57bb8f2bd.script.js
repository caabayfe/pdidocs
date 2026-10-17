var AclInfoService = Class.create();
AclInfoService.prototype = {
    TABLE_ACL: 'sys_security_acl',
    TABLE_ACL_ROLE: 'sys_security_acl_role',

    initialize: function() {},

    /**
     * getAllByRole
     * Return information about ACLs which use specified role, filtering by specified ACL operations,
     * and filtering out ACLs for specified tables
     * @param {string} roleId sys_id of role record
     * @param {array} filterAclOps array of strings (enumeration of choice field sys_security_acl.operation)
     * @param {array} ignoredTables array of table names
     * @returns {object} an iterator object with interface
     * { next(), getId(), getName(), getOperation(), getCondition(), getScript() }
     */
    getAllByRole: function(roleId, filterAclOps, ignoredTables) {
        var tableFieldName = 'sys_security_acl.name';
        var aclReferenceName = 'sys_security_acl.';
        var hacl = new GlideRecord(this.TABLE_ACL_ROLE);

        hacl.addQuery('sys_user_role', '=', roleId);
        this._query(hacl, tableFieldName, aclReferenceName, filterAclOps, ignoredTables)

        return this._toRecordIterator(hacl);
    },

    /**
     * getNonRoleAclsByTables
     * Return ACLs which apply to specified tables for specified list of operations, and which don't have any associated roles
     * @param {string} tableNames
     * @param {array} filterAclOps array of strings (enumeration of choice field sys_security_acl.operation)
     * @param {array} ignoredTables array of table names
     * @returns {object} an iterator object with interface
     * { next(), getId(), getName(), getOperation(), getCondition(), getScript() }
     */
    getNonRoleAclsByTables: function(tableNames, filterAclOps, ignoredTables) {
        var tableFieldName = 'name';
        var aclReferenceName = '';
        var hacl = new GlideRecord(this.TABLE_ACL);

        tableNames = tableNames.map(tableName => GlideStringUtil.escapeQueryTermSeparator(tableName));

        hacl.addEncodedQuery('RLQUERYsys_security_acl_role.sys_security_acl,=00,m2m^ENDRLQUERY', true);
        hacl.addEncodedQuery('nameLIKE' + tableNames.join('^ORnameLIKE'), true);
        this._query(hacl, tableFieldName, aclReferenceName, filterAclOps, ignoredTables);

        return this._toRecordIterator(hacl);
    },

    /**
     * getAllAclsByTables
     * Return ACLs which apply to specified tables for specified list of operations
     * @param {string} tableNames 
     * @param {array} filterAclOps array of strings (enumeration of choice field sys_security_acl.operation)
     * @param {array} ignoredTables array of table names
     * @returns array of objects of the form  {"operation", "name", "id" ,"condition", "script"}
     */
    getAllAclsByTables: function(tableNames, filterAclOps, ignoredTables) {
        var tableFieldName = 'name';
        var aclReferenceName = '';
        var hacl = new GlideRecord(this.TABLE_ACL);

        tableNames = tableNames.map(tableName => GlideStringUtil.escapeQueryTermSeparator(tableName));

        hacl.addEncodedQuery('nameLIKE' + tableNames.join('^ORnameLIKE'), true);
        this._query(hacl, tableFieldName, aclReferenceName, filterAclOps, ignoredTables);

        return this._toRecordIterator(hacl);
    },

    _query: function(hacl, tableFieldName, aclReferenceName, filterAclOps, ignoredTables) {
        // add some functions to simplify querying
        hacl.addFunction(this._getFunctionField(tableFieldName, null)); // parse out the table name
        hacl.addFunction(this._getFunctionField(tableFieldName, 3)); // get first X characters of table
        hacl.addFunction(this._getFunctionField(tableFieldName, 4)); // get first X characters of table
        hacl.addFunction(this._getFunctionField(tableFieldName, 5)); // get first X characters of table

        hacl.addQuery(aclReferenceName + 'type', '=', 'record');
        hacl.addQuery(aclReferenceName + 'active', '=', true); // only loook at active ACLs
        hacl.addQuery(aclReferenceName + 'operation', 'IN', filterAclOps);

        // ignore rows without a valid ACL
        hacl.addNotNullQuery(aclReferenceName + 'name');

        ignoredTables = ignoredTables.map(tableName => GlideStringUtil.escapeQueryTermSeparator(tableName));

        hacl.addEncodedQuery(this._getFunctionField(tableFieldName, null) + '!=' + ignoredTables.join('^' + this._getFunctionField(tableFieldName, null) + '!='), true);

        // exclude some tables we are never interested in
        hacl.addQuery(this._getFunctionField(tableFieldName, 3), '!=', 'pa_');
        hacl.addQuery(this._getFunctionField(tableFieldName, 4), '!=', 'sys_');
        hacl.addQuery(this._getFunctionField(tableFieldName, 4), '!=', 'ts_v');
        hacl.addQuery(this._getFunctionField(tableFieldName, 5), '!=', 'ts_c_');
        hacl.orderBy(aclReferenceName + 'operation');
        hacl.orderBy(tableFieldName);

        hacl.query();
    },

    _toRecordIterator: function(aclRecord) {
        if (aclRecord.getTableName() == this.TABLE_ACL_ROLE) {
            return {
                next: function() {
                    return aclRecord.next();
                },
                getOperation: function() {
                    return aclRecord.sys_security_acl.operation.toString();
                },
                getName: function() {
                    return aclRecord.sys_security_acl.getDisplayValue();
                },
                getId: function() {
                    return aclRecord.getValue('sys_security_acl')
                },
                getCondition: function() {
                    return aclRecord.sys_security_acl.condition.toString();
                },
                getScript: function() {
                    return aclRecord.sys_security_acl.script.toString();
                }
            }
        } else {
            return {
                next: function() {
                    return aclRecord.next();
                },

                getOperation: function() {
                    return aclRecord.operation.toString();
                },
                getName: function() {
                    return aclRecord.getDisplayValue();
                },
                getId: function() {
                    return aclRecord.getUniqueValue();
                },
                getCondition: function() {
                    return aclRecord.condition.toString();
                },
                getScript: function() {
                    return aclRecord.script.toString();
                }
            }
        }
    },

    _toInfo: function(aclRecord) {
        var result = [];
        while (aclRecord.next()) {
            result.push(this._toInfoRecord(aclRecord));
        }
        return result;
    },

    _toInfoRecord: function(aclRecord) {
        var result = {
            "operation": null,
            "name": null,
            "id": null,
            "condition": null,
            "script": null
        };
        if (aclRecord.getTableName() == this.TABLE_ACL_ROLE) {
            result.operation = aclRecord.sys_security_acl.operation.toString();
            result.name = aclRecord.sys_security_acl.getDisplayValue();
            result.condition = aclRecord.sys_security_acl.condition.toString();
            result.script = aclRecord.sys_security_acl.script.toString();
            result.id = aclRecord.getValue('sys_security_acl')

        } else {
            result.operation = aclRecord.getValue('operation');
            result.name = aclRecord.getDisplayValue();
            result.condition = aclRecord.condition.toString();
            result.script = aclRecord.script.toString();
            result.id = aclRecord.getValue('sys_id');
        }
        return result;
    },

    _getFunctionField: function(fieldName, fieldLength) {
        if (gs.nil(fieldLength)) {
            return "glidefunction:substring(concat(" + fieldName + ",'.'),'1',subtract(position('.', concat(" + fieldName + ",'.'), '1'), '1'))";
        } else {
            return "glidefunction:substring(" + fieldName + ",'1','" + fieldLength + "'))";
        }
    },

    type: 'AclInfoService'
};
