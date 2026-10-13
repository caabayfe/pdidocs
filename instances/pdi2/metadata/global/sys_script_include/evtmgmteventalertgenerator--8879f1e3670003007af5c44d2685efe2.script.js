var EvtMgmtEventAlertGenerator = Class.create();

/*
function for allowing the user to populate any columns he wants in event/alert
 */

function populateAdditionalColumns(gr, generalInfo) {
    if (generalInfo) {
        for (var key in generalInfo) {

            gr.setValue(key, generalInfo[key]);

        }

    }
}


EvtMgmtEventAlertGenerator.prototype = {

    // constant for event/alert source
    SOURCE: "EMSelfMonitoring",

    //constant for event alert type
    TYPE: "SelfMonitoring",

    /*
	
 	* function creats remote or local glide record
	
 	*/

    createGr: function(table) {

        var gr;
        if (this.isRemoteURLDefined()) {
            gr = new GlideRemoteGlideRecord(this.getRemoteURL(), table);
            this.setBasicAuth(gr);
        } else {
            gr = new GlideRecord(table);
        }
        gr.initialize();
        return gr;
    },

    /*
     * checks does the URL for remote  repository defined
     */
    isRemoteURLDefined: function() {
        var remoteUrl = this.getRemoteURL();

        return (GlideStringUtil.notNil(remoteUrl));

    },

    /*
     * gets the    remote  repository URL
     */
    getRemoteURL: function() {
        var remoteUrl = GlideProperties.get("evt_mgmt.remote_self_monitoring_url");
        return remoteUrl;

    },

    /*
     * gets domain property for self monitoring
     */
    getDomainProperty: function() {
        var domain = GlideProperties.get("evt_mgmt.domain_self_monitoring");
        return domain;

    },

    /*
	check that doamin property is not empty
 	*/
    isDomainSet: function() {
        var domain = this.getDomainProperty();

        return GlideStringUtil.notNil(domain);

    },

    /*
	sets domain by property
 	*/

    setPropertyDomain: function(currentDomain) {

        if (this.isDomainSet()) {
            var domain = this.getDomainProperty();
            if (domain != currentDomain) {
                GlideSession.get().setDomainID(domain);
            }

        }
    },
    /*
    convert additonal info to object in case it is string
    */

    convertAdditionalInfo: function(addtionalInfo) {

        if (!addtionalInfo) {
            return {};
        }

        if (typeof addtionalInfo === 'string') {
            return JSON.parse(addtionalInfo);
        }

        return addtionalInfo;

    },

    /*
		call this function to create alert.
		msgKey: Optional. msgKey,
		severity: Mandatory. severity,
		description: Optional.description,
		aditionaInfo:Optional.aditionaInfo,
		glideMonitor:Optional. glide record of the selected monitor in  monitor table ,
		glideState: Optional.glide record of the selected monitor state  in  monitor state table
		monitorName: Optional.the name of the monitor if glideMonitor is missing,
		stateName: Optional. the name of the state if glideState is missing
		generalInfo: Optional. object with key value. each key is a name of a column in alert table.
		each value of the key will be inserted as the column value.
 		*/

    openAlert: function(msgKey, severity, description, aditionaInfo, glideMonitor, glideState, monitorName, stateName, generalInfo, workNote) {
        //last event time, last remote time and initial event and remote time

        try {

            var healthMonitorCommon = new EvtMgmtHealthMonitorCommon();


            aditionaInfo = this.convertAdditionalInfo(aditionaInfo);
            var currentTime = new GlideDateTime();
            var currentDomain = GlideSession.get().getCurrentDomainID();

            this.setPropertyDomain(currentDomain);
            var gr = this.createGr("em_alert");
            //empty message key get it from EvtMgmtHealthMonitorCommon
            if (!msgKey) {
                msgKey = healthMonitorCommon.getMessageKey(null, glideMonitor, null, glideState);

            }
            //check if the alert allready exists

            gr.addQuery('message_key', 'IN', msgKey);
            gr.addQuery('state', '!=', "Closed");

            gr.query();
            var isAlertExist = false;
            //alert exist just update
            if (gr.next()) {
                isAlertExist = true;

            }
            //create new alert
            else {
                var resData = healthMonitorCommon.getCmdbCIData(true, null, glideMonitor, null, glideState, this.explicitBindedName);

                gr.setValue("source", this.SOURCE);
                gr.setValue("type", this.TYPE);
                gr.setValue("initial_remote_time", currentTime);
                gr.setValue("initial_event_time", currentTime);
                gr.setValue("message_key", msgKey);
                // cmdb_ci can be empty if self-health feature is on "Alerts Only" mode (so EM health Cis does not exists)
                if (GlideStringUtil.notNil(resData.cmdb_ci) && typeof resData.cmdb_ci !== "undefined")
                    gr.setValue("cmdb_ci", resData.cmdb_ci);
				
			    if (monitorName) {
                    gr.setValue("metric_name", monitorName);

                } else {
                    gr.setValue("metric_name", glideMonitor.getValue("name"));
                }

                if (stateName) {
                    gr.setValue("resource", stateName);

                } else {
                    gr.setValue("resource", glideState.getValue("name"));

                }
            }
            var alertSysId = "";
            if (aditionaInfo) {
                gr.setValue("additional_info", JSON.stringify(aditionaInfo));

            }
            if (description) {
                gr.setValue("description", description);

            }
            gr.setValue("last_event_time", currentTime);
            gr.setValue("last_remote_time", currentTime);
            gr.setValue("last_update_time_by_event", new Date().getTime());

            gr.setValue("severity", severity);

            populateAdditionalColumns(gr, generalInfo);

            if (isAlertExist) {
                if (gr.update()) {
                    alertSysId = gr.getUniqueValue();
                }
            } else {
                alertSysId = gr.insert();
            }

            if (workNote && workNote + '' != 'undefined' && global.JSUtil.notNil(alertSysId)) {
                var alertManager = new SNC.AlertManager();
                var alertGr = new GlideRecord("em_alert");
                if (alertGr.get(alertSysId)) {
                    alertManager.updateWorkNotesOnAlert(alertGr, workNote);
                    alertGr.update();
                }

            }

            GlideSession.get().setDomainID(currentDomain);
            return alertSysId;
        } catch (er) {
            gs.log(er);
            return null;
        }

    },

    /*
		call this function for closing open alerts
		msgKey: used for finding the closing alert
		workNote: the work note that will be added when alert closed.
		glideMonitor: glide record of the monitor
		glideState: glode record of monitor state
		
		
 		*/
    closeAlert: function(msgKey, workNote, glideMonitor, glideState) {

        var currentDomain = GlideSession.get().getCurrentDomainID();
        this.setPropertyDomain(currentDomain);
        var alert = this.createGr("em_alert");
		var retVal = null;

        var healthMonitorCommon = new EvtMgmtHealthMonitorCommon();

        //empty message key get it from EvtMgmtHealthMonitorCommon
        if (!msgKey) {
            msgKey = healthMonitorCommon.getMessageKey(null, glideMonitor, null, glideState);

        }
        alert.addQuery('state', '!=', 'Closed');
        alert.addQuery('message_key', 'IN', msgKey);
        alert.query();
        if (alert.next()) {
            alert.setValue('state', 'Closed');
            var alertManager = new SNC.AlertManager();
            alertManager.updateWorkNotesOnAlert(alert, workNote);
            alert.update();
			retVal = alert.getValue("sys_id");
        }
        GlideSession.get().setDomainID(currentDomain);
		return retVal;

    },

    /*
     Update an alert description
     */
    updateAlertDescription: function(msgKey, newDescription) {
        var alert = this.createGr("em_alert");
        alert.addQuery('state', '!=', 'Closed');
        alert.addQuery('message_key', msgKey);
        alert.addQuery('description', '!=', newDescription);
        alert.query();
        if (alert.next()) {
            alert.setValue('description', newDescription);
            alert.update();
        }
    },

    /*
     Update an alert description
     */
    getDescriptionFromAlert: function(msgKey) {
        var alert = this.createGr("em_alert");
        alert.addQuery('state', '!=', 'Closed');
        alert.addQuery('message_key', msgKey);
        alert.query();
        if (alert.next()) {
            return alert.description;
        }
        return null;
    },



    /*
		get basic auth for calling remote instance
 		*/
    setBasicAuth: function(remoteGlideRecord) {
        var credentialsName = GlideProperties.get("evt_mgmt.remote_self_monitor_credentials");
        var credentials = new GlideRecord('discovery_credentials');
        credentials.addQuery('name', '=', credentialsName);
        credentials.query();
        var remoteCredentials = {};
        credentials.next();
        remoteCredentials['user_name'] = credentials.getValue('user_name');
        gs.log(credentials.getValue('user_name'));
		
		var pwd = credentials.getElement("password");
		remoteCredentials['password'] =  pwd.getDecryptedValue();

        remoteGlideRecord.setBasicAuth(remoteCredentials['user_name'],
        remoteCredentials['password']);
    },

    setExplicitBindedName: function(explicitBindedName) {
        this.explicitBindedName = explicitBindedName;
    },


    /*
	inner function for inserting event
 	*/

    insertEvent: function(gr, msgKey, severity, description, aditionaInfo, glideMonitor, glideState, monitorName, stateName, generalInfo, resulotionState) {


        var healthMonitorCommon = new EvtMgmtHealthMonitorCommon();

        //missing msg key
        if (!msgKey) {
            msgKey = healthMonitorCommon.getMessageKey(null, glideMonitor, null, glideState);
        }

        try {


            //Create the new event record
            gr.setValue("source", this.SOURCE);
            gr.setValue("resolution_state", resulotionState);
            gr.setValue("type", this.TYPE);
            gr.setValue("message_key", msgKey);

            var additionalInformation = this.convertAdditionalInfo(aditionaInfo);

            //If there isn't allready ci data, call getCmdbCIData
            if ((!(additionalInformation.correlation_id)) && (!(additionalInformation.name))) {

                var resData = healthMonitorCommon.getCmdbCIData(false, null, glideMonitor, null, glideState, this.explicitBindedName);

                //in case setting the node, we want to bind the CI according the node only
				if (this.node) {
                    gr.setValue('node', this.node);
                } else {

                    if (resData.correlation_id)
                        additionalInformation.correlation_id = resData.correlation_id;

                    if (resData.internal_name)
                        additionalInformation.internal_name = resData.internal_name;

                    if (resData.ci_type) {
                        gr.setValue("ci_type", resData.ci_type);
                    }
                }
            }

            gr.setValue("additional_info", JSON.stringify(additionalInformation));

            if (description) {
                gr.setValue("description", description);
            }

            if (monitorName) {
                gr.setValue("metric_name", monitorName);
            } else {
                gr.setValue("metric_name", glideMonitor.getValue("name"));
            }

            if (stateName) {
                gr.setValue("resource", stateName);
            } else {
                gr.setValue("resource", glideState.getValue("name"));
            }
            var currentTime = new GlideDateTime();

            gr.setValue("time_of_event", currentTime);
            gr.setValue("severity", severity);

            populateAdditionalColumns(gr, generalInfo);
            gr.insert();
            return gr.getValue("sys_id");
        } catch (er) {
            gs.log(er);
            return null;
        }


    },



    /*
			call this function to create event.
			msgKey: Optional,  msgKey,
			severity:Mandatory, severity,
			description:Optional.description,
			aditionaInfo:OptionaladitionaInfo,
			glideMonitor:Optional, glide record of the selected monitor in  monitor table ,
			glideState: Optional, glide record of the selected monitor state  in  monitor state table
			monitorName:Optional,  the name of the monitor if glideMonitor is missing,
			stateName: Optional, the name of the state if glideState is missing
			generalInfo: Optional. object with key value. each key is a name of a column in event table.
			each value of the key will be inserted as the column value.
 			*/
    openEvent: function(msgKey, severity, description, aditionaInfo, glideMonitor, glideState, monitorName, stateName, generalInfo) {
        var currentDomain = GlideSession.get().getCurrentDomainID();
        this.setPropertyDomain(currentDomain);

        var event = this.createGr("em_event");
        var sys_id = this.insertEvent(event, msgKey, severity, description, aditionaInfo, glideMonitor, glideState, monitorName, stateName, generalInfo, "New");
        GlideSession.get().setDomainID(currentDomain);
        return sys_id;


    },


    /*
			call this function to close alert by event.
			msgKey: msgKey,
			severity:severity,
			description:description,
			aditionaInfo:aditionaInfo,
			glideMonitor: glide record of the selected monitor in  monitor table ,
			glideState: glide record of the selected monitor state  in  monitor state table
			monitorName: the name of the monitor if glideMonitor is missing,
			stateName: the name of the state if glideState is missing
 			*/
    closeEvent: function(msgKey, severity, description, aditionaInfo, glideMonitor, glideState, monitorName, stateName, generalInfo) {

        var currentDomain = GlideSession.get().getCurrentDomainID();
        this.setPropertyDomain(currentDomain);
        var event = this.createGr("em_event");

        var sys_id = this.insertEvent(event, msgKey, severity, description, aditionaInfo, glideMonitor, glideState, monitorName, stateName, generalInfo, "Closing");
        GlideSession.get().setDomainID(currentDomain);
        return sys_id;
    },


    initialize: function() {},

    type: 'EvtMgmtEventAlertGenerator'
};
