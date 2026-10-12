var UXAFunnelMigration = Class.create();
UXAFunnelMigration.prototype = {
    initialize: function() {
        this.config = {
            app_table_name: "FunnelsMigration",
            app_record_id: "rec_id"
        };
        this.platformMap = {
            "0": "iOS",
            "1": "Android",
            "2": "Web",
            "3": "Chat"
        };
    },
    getApiResponse: function(url, params) {
        this.config.endpoint = url;
        var client = new AppseeServiceHttpClient(this.config, params);
        var response = client.doPost(params);
        return response;
    },
    migrateFunnels: function() {
        try {
            var availableInstanceFunnelIds = this.getExistingFunnelIds();
            var funnelsData = this.getFunnelsData();
            var complete = this.insertFunnelsData(funnelsData, availableInstanceFunnelIds);
            var migrationComplete = complete ? 'complete' : 'in-progress';
            gs.info('UXA Migration job for Funnels ran completely, current status - ' + migrationComplete);
            return complete;
        } catch (ex) {
            gs.error('UXA Migration job for Funnels failed - ' + JSON.stringify(ex));
            throw new Error('UXA Migration job for Funnels failed.', ex);
        }

    },

    getFunnelsData: function() {
        try {
            var funnelsData = this.getApiResponse('/instance/funnels/get-all-instance-funnels', {});
            return funnelsData;
        } catch (ex) {
            const error = ex;
            throw new Error('Failed to get funnel details from API + ', ex);
        }
    },

    insertFunnelsData: function(responseData, availableInstanceFunnelIds) {
        var funnelsGR = new GlideRecord("sys_uxa_funnel");
        var processedFunnelNames = [];
        responseData?.forEach(function data(funnelData) {
            if (!availableInstanceFunnelIds.includes(funnelData["Id"])) {
                var modifiedFunnelName = funnelData["Name"];
                // check for duplicate funnel and rename the funnel if needed
                if (processedFunnelNames.includes(funnelData["Name"])) {
                    modifiedFunnelName = `${funnelData["Name"]} - ${this.platformMap[String(funnelData["Platform"])] || String(funnelData["Platform"])}`;
                }
                funnelsGR.initialize();
                funnelsGR.setValue("name", modifiedFunnelName);
                funnelsGR.setValue("steps", JSON.stringify(funnelData["Steps"]));
                funnelsGR.setValue("type", funnelData["Type"]);
                funnelsGR.setValue("app_sys_id", funnelData["AppSysId"]);
                funnelsGR.setValue("legacy_id", funnelData["Id"]);
                funnelsGR.setValue("status", funnelData["Status"]);
                if (funnelData["Rank"] > 0) {
                    funnelsGR.setValue("pinned", true);
                } else {
                    funnelsGR.setValue("pinned", false);
                }
                funnelsGR.insert();
            }
            if (!processedFunnelNames.includes(funnelData["Name"])) {
                processedFunnelNames.push(funnelData["Name"]);
            }
        }.bind(this));

        return true;
    },
    getExistingFunnelIds: function() {
        var funnelRecords = new GlideRecord("sys_uxa_funnel");
        var funnelIds = [];
        funnelRecords.query();
        while (funnelRecords.next()) {
            funnelIds.push(funnelRecords.getValue("legacy_id"));
        }
        return funnelIds;
    },
    type: 'UXAFunnelMigration'
};
