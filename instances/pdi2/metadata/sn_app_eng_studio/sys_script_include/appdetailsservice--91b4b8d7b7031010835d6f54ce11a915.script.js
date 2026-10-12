var AppDetailsService = (function() {
    return {
        /**
         * @param {string} sys_id of the application
         *
         * @param {object} request body object
         *
         * @return {string} sys_id of the app_details record the application is now linked to
         */
        createAppDetails: function(appSysId, requestBodyData) {
            var appDetails;
            var appDetailsSysId;
            var operations = '[]';

            AccessValidator.verifyApplicationAccess(appSysId);

            if (requestBodyData.hasOwnProperty('operations')) {
                if (!Array.isArray(requestBodyData.operations)) {
                    throw CreatorStudioConstants.errors.IMPROPER_FORMAT;
                }

                operations = JSON.stringify(requestBodyData.operations);
            }

            appDetails = new GlideRecord(CreatorStudioConstants.appDetailsTable.NAME);
            appDetails.initialize();
            appDetails.application = appSysId;
            appDetails.operations = operations;
            appDetailsSysId = appDetails.insert();

            if (!appDetailsSysId) {
                throw CreatorStudioConstants.errors.INSERT_FAILURE;
            }

            return appDetailsSysId;
        }
    };
})();
