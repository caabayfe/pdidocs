var PDACLUtils = Class.create();
PDACLUtils.prototype = {
    initialize: function() {
        this.fdContentFiltering = new FlowDesignerContentFiltering();
    },

    hasDelegatedAccessToPlaybookApi: function() {
        // this resource is defined in the Playbook Development Permission Set
        return gs.hasRightsTo('api/playbook.delegated/allow', {
            scopeId: gs.getCurrentApplicationId()
        });
    },

    contentFilteringCanRead: function(contentGr) {
        // Should only be used to verify "read" access against a Resource Filter Rules on resourcePath
        // check read access against the process definition
        var recordGr = this._getParentProcessDefinitionRecord(contentGr);

        if (!recordGr) {
            return false; // access can be granted through additional filter rules
        }

        return this.fdContentFiltering.canRead(recordGr);
    },

    contentFilteringCanCreate: function(contentGr) {
        // Note: FDContentFiltering only checks "create" access for delegated developer on resourcePath
        return this.fdContentFiltering.canCreate(contentGr);
    },

    _getParentProcessDefinitionRecord: function(contentGr) {
        // e.g. sys_pd_snapshot_input fields = ['model', 'source']
        //     resulting dotwalk path = contentGr.model.source
        var recordClassName = contentGr.getRecordClassName();
        var fields = [PDConstants.FIELDS.PROCESS_DEFINITION];
        if (!PDUtils.isNullOrUndefined(PDConstants.TABLE_REFERENCE_FIELD_MAP[recordClassName])) {
            fields = PDConstants.TABLE_REFERENCE_FIELD_MAP[recordClassName];
        }

        return this._dotwalkToParent(contentGr, fields);
    },

    _dotwalkToParent: function(obj, fields) {
        var value = obj;
        for (var i = 0; i < fields.length; i++) {
            if (value == null) { // Check for null or undefined
                return undefined;
            }
            value = this._getReferenceForField(value, fields[i]);
        }

        return value;
    },

    _getReferenceForField: function(record, field) {
        if (record && record.isValidField(field)) {
			// no need to check isValidRecord here since a new/blank process def is valid for our usecase e.g. when creating a new record where parent process def needs to be set
			return record[field].getRefRecord();
        }
        return null;
    },

    userHasRole: function(roleName, loggingEnabled) {
        if (gs.nil(roleName)) return false;
        var roles = gs.getUser().getRoles() || [];
        var hasRole = roles.indexOf(roleName) >= 0;

        if (!hasRole && !!loggingEnabled) {
            gs.info('PDACLUtils - User does not have the role ' + roleName);
        }

        return hasRole;
    },

    type: 'PDACLUtils'
};
