var EvtMgmtMidConnectorCacheHandler = Class.create();
EvtMgmtMidConnectorCacheHandler.prototype = {
    MIDCONNECTORS_LASTUPDATEDTIME_NAME: "MidConnectorCacheRecords.lastUpdatedTime",
    EVTMGMT_MIDCONNECTOR_CACHE_UPDATETIME_SECS: "evt_mgmt.midconnector_cache_updatetime_minus_seconds",
    initialize: function() {},

    midConnectorCacheUpdateSendEccReq: function(operation, sysId) {
        var res = true;
        var LAUNCHPAD_CONNECTOR_INSTANCE_TABLE = "sn_itom_integ_app_instance_details";
        var CONNECTOR_PARAMS_TABLE = "sn_em_connector_push_config";
        var CONNECTOR_INSTANCE_PARAMS_TABLE = "sn_em_connector_push_instance_config_param";
        var updatedTimeFieldName = "sys_updated_on";
        var currentTime = new GlideDateTime();
        currentTime.addSeconds(-1 * (gs.getProperty(this.EVTMGMT_MIDCONNECTOR_CACHE_UPDATETIME_SECS, 10))); // look from 10 seconds before so that we will not miss any updated records

        try {
            var probe = SncProbe.get("Update Mid Connectors Cache Probe");

            probe.addParameter('type', 'midpushconnector');
            probe.setEccPriority("2");

            if (operation == "update") {

                var lastUpdatedTime = this.getLastUpdatedTime();

                var isNameTagsTableUpdated = this.wasTableUpdated(LAUNCHPAD_CONNECTOR_INSTANCE_TABLE, updatedTimeFieldName, lastUpdatedTime);
                var isParamTableUpdated = this.wasTableUpdated(CONNECTOR_PARAMS_TABLE, updatedTimeFieldName, lastUpdatedTime);
                var isInstanceParamTableUpdated = this.wasTableUpdated(CONNECTOR_INSTANCE_PARAMS_TABLE, updatedTimeFieldName, lastUpdatedTime);

                if (isNameTagsTableUpdated || isParamTableUpdated || isInstanceParamTableUpdated) {
                    //this.printDebug("sending probe to update mid connectorcache");
                    probe.addParameter('updateNameTags', isNameTagsTableUpdated ? 'true' : 'false');
                    probe.addParameter('updateParams', isParamTableUpdated ? 'true' : 'false');
                    probe.addParameter('updateInstanceParams', isInstanceParamTableUpdated ? 'true' : 'false');

                    probe.addParameter('operation', 'cacheUpdate');
                    probe.addParameter('updatedTime', lastUpdatedTime);

                    this.printDebug("Sending Update Mid Connectors Cache Probe " + "updateNameTags=" + isNameTagsTableUpdated + " updateParams=" + isParamTableUpdated + "  updateInstanceParams=" + isInstanceParamTableUpdated + " operation=cacheUpdate");

                    res = this.sendProbe(probe);
                    if (res) {
                        this.updateHash(currentTime.getValue());
                    }
                } else {
                    this.updateHash(currentTime.getValue());
                }
            } else if (operation == "delete") {
                this.printDebug("sending probe to delete some records from mid connectorcache");
                probe.addParameter('operation', 'cacheRecordDelete');
                probe.addParameter('sysId', sysId);

                res = this.sendProbe(probe);
            } else if (operation == "cacheExpiredFlush") {
                this.printDebug("sending probe to check and delete cache records that are expired from mid connectorcache");
                probe.addParameter('operation', 'cacheExpiredFlush');
                res = this.sendProbe(probe);
            }
            return res;

        } catch (e) {
            gs.error("EvtMgmtMidConnectorCacheHandler.MidConnectorCacheUpdateSendEccReq script include failed: " + e + ", " + e.stack);
            return false;
        }
    },

    /**
     * send the probe to all mid servers where the event listener is up and running
     * @param probe
     * @returns {boolean}
     */
    sendProbe: function(probe) {
        var res = true;
        var midsToSendTo = this.getEventListenerMidServers();

        this.printDebug("Sending ecc update command MidConnectorCacheUpdateSendEccReq for mids " + midsToSendTo);

        for (var i = 0; i < midsToSendTo.length; i++) {

            var localRes = probe.create(midsToSendTo[i]);

            //make sure localRes doesn't has a value
            if (!(localRes)) {
                res = false;
                gs.error("EvtMgmtMidConnectorCacheHandler.MidConnectorCacheUpdateSendEccReq Error on sending probe to mid : " + midsToSendTo[i]);
            }
        }
        //this.printDebug("after sending ECCQUEUE entry for MidConnectorCacheUpdateSendEccReq");
        return res;
    },

    /**
     * get the list of mid servers that has Event Listeners that are in UP state
     * @returns {*[]}
     */
    getEventListenerMidServers: function() {
        var midservers = [];
        var gr = new GlideRecord("ecc_agent_ext_context_event");
        gr.addQuery('status', 'Started');
        gr.query();

        while (gr.next()) {
            if (GlideStringUtil.notNil(gr.executing_on.name) && (midservers.indexOf(gr.executing_on.name) == -1)) {
                midservers.push(gr.executing_on.name);
            }
        }
        return midservers;
    },

    printDebug: function(message) {
        if (gs.getProperty('evt_mgmt.log_debug', 'false') == 'true') {
            var debugMsg = "EvtMgmtMidConnectorCacheHandler: ";
            debugMsg += message;
            gs.debug(debugMsg);
        }
    },

    /**
     * Check whether the given tableName has rows/records that are updated after lastUpdatedTime
     * @param tableName
     * @param updatedTimeFieldName
     * @param lastUpdatedTime
     * @returns {boolean} true if there any updated records after lastUpdatedTime else false
     */
    wasTableUpdated: function(tableName, updatedTimeFieldName, lastUpdatedTime) {

        try {

            var tableGr = new GlideRecord(tableName);
            if ((tableGr.isValid()) && ((updatedTimeFieldName) && (tableGr.isValidField(updatedTimeFieldName)))) {
                tableGr.addQuery(updatedTimeFieldName, ">", lastUpdatedTime);
                tableGr.orderByDesc(updatedTimeFieldName);
                tableGr.setLimit(1);
                tableGr.query();
                if (tableGr.next()) {
                    return true;
                }
                return false;
            }
            return false;

        } catch (e) {
            gs.error("EvtMgmtMidConnectorCacheHandler.wasTableUpdated script include failed: " + e);
            return false;
        }
    },

    /**
     * if we have lastUpdatedTime it will return it otherwise will return 0;
     * @returns {number}
     */
    getLastUpdatedTime: function() {
        var hashGr = new GlideRecord("sa_hash");
        hashGr.addQuery("name", this.MIDCONNECTORS_LASTUPDATEDTIME_NAME);
        hashGr.query();

        var lastUpdatedTime = 0;
        if (hashGr.next()) {
            lastUpdatedTime = hashGr.getValue("hash");
        } else {
            hashGr.initialize();
            hashGr.setValue("name", this.MIDCONNECTORS_LASTUPDATEDTIME_NAME);
            hashGr.setValue("hash", lastUpdatedTime);
            hashGr.insert();
        }
        return lastUpdatedTime;
    },


    updateHash: function(lastUpdatedTime) {

        try {
            var hashGr = new GlideRecord("sa_hash");
            hashGr.addQuery("name", this.MIDCONNECTORS_LASTUPDATEDTIME_NAME);
            hashGr.query();

            if (hashGr.next()) {
                hashGr.setValue("hash", lastUpdatedTime);
                hashGr.update();
            } else { //need to first create that record
                hashGr.initialize();
                hashGr.setValue("name", this.MIDCONNECTORS_LASTUPDATEDTIME_NAME);
                hashGr.setValue("hash", lastUpdatedTime);
                hashGr.insert();
            }
        } catch (e) {
            gs.error("EvtMgmtMetricCacheHandler.updateHash script include failed: " + e + ", " + e.stack);
        }
    },

    type: 'EvtMgmtMidConnectorCacheHandler'
};
