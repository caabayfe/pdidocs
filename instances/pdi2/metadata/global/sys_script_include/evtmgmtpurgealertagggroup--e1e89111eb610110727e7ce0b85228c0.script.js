var EvtMgmtPurgeAlertAggGroup = Class.create();
EvtMgmtPurgeAlertAggGroup.prototype = {
    initialize: function() {
        this.SOURCE_ENUM = {
            AUTOMATED: '1',
            CMDB: '4',
            GENERALIZED: '7',
            TEXT: '8',
            TAG_CLUSTER: '11',
            NETWORK_TRAFFIC: '12',
        };
        this.SOURCES = [
            this.SOURCE_ENUM.AUTOMATED, this.SOURCE_ENUM.CMDB, this.SOURCE_ENUM.GENERALIZED,
            this.SOURCE_ENUM.TEXT, this.SOURCE_ENUM.TAG_CLUSTER, this.SOURCE_ENUM.NETWORK_TRAFFIC,
        ];

        this.CLEANUP_DELAY_SEC_PROPERTY = 'evt_mgmt.purge_alert_agg_group_cleanup_delay_sec';
        this.CLEANUP_BATCH_SIZE_PROPERTY = 'evt_mgmt.purge_alert_agg_group_cleanup_batch_size';

        this.cleanupDelaySec = Number(gs.getProperty(this.CLEANUP_DELAY_SEC_PROPERTY, 180)); //3 minutes
        this.cleanupBatchSize = Number(gs.getProperty(this.CLEANUP_BATCH_SIZE_PROPERTY, 20));

        this.alertsToDelete = [];
    },


    // For each record in Aggregation Group table check if there is any alert in the Group ALert table. 
    // If not then delete it from Group table. Group Alert table has cascade delete based on Alert SysId 
    // so the records are deleted when the alert is closed

    deleteEmptyAnalyticsGroups: function() {
        gs.info('EvtMgmtPurgeAlertAggGroup: script started.');

        var groupsWithAlerts = {};
        var groupsWithAlertsGr = new GlideRecord('em_agg_group');
        groupsWithAlertsGr.addQuery('source', 'IN', this.SOURCES);
        groupsWithAlertsGr.addJoinQuery('em_agg_group_alert', 'sys_id', 'group_id');
        groupsWithAlertsGr.query();

        while (groupsWithAlertsGr.next()) {
            var sysId = groupsWithAlertsGr.getValue('sys_id');
            groupsWithAlerts[sysId] = true;
        }

        var groupsGr = new GlideRecord('em_agg_group');
        groupsGr.addQuery('source', 'IN', this.SOURCES);
        groupsGr.query();

        //do not delete groups that were created before minGroupCreatedTime
        var minGroupCreatedTime = new GlideDateTime();
        minGroupCreatedTime.subtract(this.cleanupDelaySec * 1000);

        while (groupsGr.next()) {
            sysId = groupsGr.getValue('sys_id');

            if (!groupsWithAlerts.hasOwnProperty(sysId) && (groupsGr.getValue('sys_created_on') < minGroupCreatedTime)) {
                this.alertsToDelete.push(groupsGr.getValue("primary_alert_id"));
                groupsGr.deleteRecord();
            }
        }
        this.deleteCorrespondingAlerts();

        gs.info('EvtMgmtPurgeAlertAggGroup: script finished.');

    },

    deleteCorrespondingAlerts: function() {
        if (this.alertsToDelete.length > 0) {

            var alertsBatch = [];
            var lastAlertIndex = 0;
            var count = 0;

            //deleting in batches
            for (i = 0; i < this.alertsToDelete.length; i++) {
                alertsBatch.push(this.alertsToDelete[i]);

                if ((++count >= this.cleanupBatchSize) || (i >= this.alertsToDelete.length - 1) /*the last element*/ ) {
                    var alertsGr = new GlideRecord("em_alert");
                    alertsGr.addQuery("sys_id", "IN", alertsBatch);
                    alertsGr.query();
                    alertsGr.deleteMultiple();

                    count = 0;
                    alertsBatch.length = 0; //clear the batch array
                }
            }
        }
    },

    type: 'EvtMgmtPurgeAlertAggGroup'
};
