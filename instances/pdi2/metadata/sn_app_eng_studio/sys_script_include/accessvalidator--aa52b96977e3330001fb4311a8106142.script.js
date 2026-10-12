var AccessValidator = (function() {

    return {

        canReadTable: function(tableName) {

            if (gs.nil(tableName))
                return false;

            var table = new GlideRecord(tableName);
            return table.canRead();
        },

        canReadRecord: function( /*GlideRecord*/ record) {

            if (gs.nil(record))
                return false;

            return record.isValid() && record.isValidRecord() && record.canRead();
        },

        canReadField: function(record, fieldName) {

            if (gs.nil(record))
                return false;

            if (gs.nil(fieldName))
                return false;

            return record.isValidField(fieldName) && record.getElement(fieldName).canRead();
        },

        checkApplicationExists: function(applicationSysId) {

            if (gs.nil(applicationSysId))
                return false;

            var record = new GlideRecord("sys_scope");

            record.addQuery("sys_id", applicationSysId);
            record.query();

            return record.hasNext();

        },

        isApplicationInGlobalScope: function(applicationSysId) {
            var applicationRecord = new GlideRecord("sys_scope");

            if (!applicationRecord.get(applicationSysId)) {
                throw CreatorStudioConstants.errors.APPLICATION_DOES_NOT_EXIST;
            }

            var applicationScope = applicationRecord.getValue("scope");

            return applicationScope === CreatorStudioConstants.GLOBAL_APPLICATION_SCOPE_NAME;
        },

        isValidRecord: function(tableName, recordSysId) {
            if (!recordSysId || recordSysId == "")
                return false;

            var tableNameGr = new GlideRecord(tableName);
            tableNameGr.get(recordSysId);
            return tableNameGr.isValidRecord();
        },

        verifyApplicationAccess: function(appSysId) {
            if (!this.checkApplicationExists(appSysId)) {

                // We need to check if the application exists because the ApplicationDataBuilder only returns
                // accessible apps for that user, so without this check we wouldn't be able to distinguish between
                // the app not existing or a user not having appropriate access.

                throw CreatorStudioConstants.errors.APPLICATION_DOES_NOT_EXIST;

            }

            if (this.isApplicationInGlobalScope(appSysId)) {
                // No user should be able to access the inventory of the global application.
                throw CreatorStudioConstants.errors.APPLICATION_ACCESS_DENIED;
            }

            var applications = new GlideRecordSecure('sys_app');

            if (!applications.get(appSysId)) {

                // Application exists, this is determined in the check above, however, the requested app did not
                // appear in the list returned by the ApplicationDataBuilder which implies the user does not have
                // access to the requested application.

                throw CreatorStudioConstants.errors.APPLICATION_ACCESS_DENIED;
            }
        }

    };

})();
