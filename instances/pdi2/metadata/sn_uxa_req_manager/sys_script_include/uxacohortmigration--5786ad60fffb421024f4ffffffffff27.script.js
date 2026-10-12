var UXACohortMigration = Class.create();
UXACohortMigration.prototype = {
    initialize: function() {
        this.config = {
            app_table_name: "CohortsMigration",
            app_record_id: "rec_id"
        };
        this.platformMap = {
            "0": "iOS",
            "1": "Android",
            "2": "Web",
            "3": "Chat"
        };
    },
    migrateCohorts: function() {
        try {
            var availableInstanceCohortIds = this.getExistingCohortIds();
            const cohortsData = this.getCohortData();
            var complete = this.insertCohortData(cohortsData, availableInstanceCohortIds);
            var migrationComplete = complete ? 'complete' : 'in-progress';
            gs.info('UXA Migration job for Cohort ran completely, current status - ' + migrationComplete);
            return complete;
        } catch (ex) {
            gs.error('UXA Migration job for Cohort failed - ' + JSON.stringify(ex));
            throw new Error("UXACohortMigration job error", ex);
        }

    },
    getApiResponse: function(url, params) {
        this.config.endpoint = url;
        var client = new AppseeServiceHttpClient(this.config, params);
        var response = client.doPost(params);
        return response;
    },
    getCohortData: function() {
        try {
            var cohortsData = this.getApiResponse('/instance/cohorts/get-all-instance-cohorts', {});
            return cohortsData;
        } catch (ex) {
            gs.error('Failed to get cohorts details from API + ' + JSON.stringify(ex));
            throw new Error('Failed to get cohorts details from API + ', ex);
        }
    },

    insertCohortData: function(responseData, availableInstanceCohortIds) {
        var cohortGR = new GlideRecord("sys_uxa_cohort");
        var processedCohortNames = [];
        responseData?.forEach(function data(cohortData) {
            if (!availableInstanceCohortIds.includes(cohortData["Id"])) {
                var modifiedCohortName = cohortData["Name"];
                // check for duplicate cohort and rename the cohort if needed
                if (processedCohortNames.includes(cohortData["Name"])) {
                    modifiedCohortName = `${cohortData["Name"]} - ${this.platformMap[String(cohortData["Platform"])] || String(cohortData["Platform"])}`;
                }
                cohortGR.initialize();
                cohortGR.setValue("name", modifiedCohortName);
                cohortGR.setValue("steps", JSON.stringify(cohortData["Steps"]));
                cohortGR.setValue("type", cohortData["Type"]);
                cohortGR.setValue("app_sys_id", cohortData["AppSysId"]);
                cohortGR.setValue("legacy_id", cohortData["Id"]);
                cohortGR.setValue("status", cohortData["Status"]);
                cohortGR.insert();
            }
            processedCohortNames.push(cohortData["Name"]);
        }.bind(this));
        return true;
    },

    getExistingCohortIds: function() {
        var cohortRecords = new GlideRecord("sys_uxa_cohort");
        var cohortIds = [];
        cohortRecords.query();
        while (cohortRecords.next()) {
            cohortIds.push(cohortRecords.getValue("legacy_id"));
        }
        return cohortIds;
    },

    type: 'UXACohortMigration'
};
