var EvtMgmtNodeCount = Class.create();
EvtMgmtNodeCount.prototype = {
    initialize: function() {},

    calculateNodeCount: function() {

		gs.log("EvtMgmtNodeCount starting");


        var mapCisToCisLists = function(alertsCis, serverCis, webAppCis, otherCis) {

			var alertsCisCount = 0;
            var classModel = SNC.ClassModel;

            for (var ciID in alertsCis) {
				alertsCisCount++;
                if (alertsCis.hasOwnProperty(ciID)) {
                    var ciObj = JSON.parse(alertsCis[ciID]);
                    var ciClass = String(ciObj["class"]);
                    if (classModel.isInstanceOf(ciClass, 'cmdb_ci_server'))
                        serverCis[ciID] = 1;
                    else if (classModel.isInstanceOf(ciClass, 'cmdb_ci_web_application'))
                        webAppCis[ciID] = 1;
                    else
                        otherCis[ciID] = 1;
					
                }
            }
			return alertsCisCount;
        };

        var writeToPerfTable = function(count, duration, json) {
            var gr = new GlideRecord("sa_performance_statistics");
            gr.setValue("type", "licenseCalculation");
            gr.setValue("count", count);
            gr.setValue("duration", duration);
            gr.setValue("extra_data", JSON.stringify(json));
            gr.insert();
        };

        var populateCisFromAlerts = function(webAppCis, from, to, alertRecordLimit) {

            //  Run query on alert table joined with web application table for CI is not empty and add each matching CI the webAppCis list
            var alertManager = new SNC.AlertManager();

		
            var grAlert = new GlideAggregate("em_alert");
            grAlert.addJoinQuery("cmdb_ci_web_application", "cmdb_ci", "sys_id");
            grAlert.addQuery("sys_updated_on", ">=", from);
			//adding = in both side to make sure we are not missing anything in the last "to" and to align with unique node query
            grAlert.addQuery("sys_updated_on", "<=", to);
			//DEF0204939 ignore security alerts
			grAlert.addQuery("classification", "!=", "1");
            grAlert.groupBy("cmdb_ci");
            grAlert.setLimit(alertRecordLimit);

            alertManager.setStepTopic("License - populate cis from alerts");
            alertManager.addStep("Join Query on em_alert and cmdb_ci_web_application");

			grAlert.query();
			var rowCount = grAlert.getRowCount();
            while (grAlert.next()) {
                webAppCis[grAlert.getValue("cmdb_ci")] = 1;
            }

            alertManager.stepReport();
            return rowCount;

        };

        /*********************************************/

        var start = new Date().getTime();
        var alertManager = new SNC.AlertManager();
        var alertRecordLimit = gs.getProperty("evt_mgmt.node_count.alert_record_limit", 100000);
        var ciRecordLimit = gs.getProperty("evt_mgmt.node_count.ci_record_limit", 100000);
		
        var rightNow = new GlideDateTime();
        var totalRowCount = 0;
        var cisFoundInAlertsCount = 0;
        var nodesFoundInAlertsCount = 0;
        var insertCount = 0; // number of CIs inserted into the license table
        var alertsWithWebCisCount = 0; // refers to query in 'populateCisFromAlerts' function

        var perfJson = {};
		
		var eventManagementUtils = new SNC.EventManagementScriptableApis();
        
        //Get all alert updated in the last hour and save their node value, ci values as well as the domain

        var now = new GlideDateTime();
        var fromTime = new GlideDateTime(now);
        var timeBack = -3600;
        var periodSec = gs.getProperty("evt_mgmt.node_count.period_slice_sec", 360);
		
        fromTime.addSeconds(timeBack);
        var toTime = new GlideDateTime(fromTime);
        toTime.addSeconds(periodSec);

        while (fromTime < now) {
            var superMap = {};
            var nodesMap = {};
            var allNodes = [];
            
            var serverCis = {};
            var webAppCis = {};
            var otherCis = {};
            var shortName2Node = {};            

            var isAlertsCIsUsed = gs.getProperty("evt_mgmt.use_alerts_cis_in_license", false);
            if (isAlertsCIsUsed == "true") {
				var alertsCis = {};
                alertManager.setStepTopic("License - get unique nodes and cis from alerts");
                alertManager.addStep("Join Query on em_alert and cmdb_ci");
                totalRowCount += eventManagementUtils.getUniqueNodesAndCIs(
                    fromTime, toTime, alertRecordLimit, shortName2Node, nodesMap, alertsCis, allNodes);
                alertManager.stepReport();
				
                nodesFoundInAlertsCount += allNodes.length;
                cisFoundInAlertsCount += mapCisToCisLists(alertsCis, serverCis, webAppCis, otherCis);

            } else {

                alertManager.setStepTopic("License - get unique nodes from alerts");
                alertManager.addStep("Query alerts");
                totalRowCount += eventManagementUtils.getDistinctNodesFromAlerts(
                    fromTime, toTime, alertRecordLimit, shortName2Node, nodesMap, allNodes);
                alertManager.stepReport();

                //Get all alerts from the last hour, joined with web application table and add their CI to webAppCis list	
                var alertsCount = populateCisFromAlerts(webAppCis, fromTime, toTime, alertRecordLimit);
                totalRowCount += alertsCount;
                alertsWithWebCisCount += alertsCount;

            }
			
            gs.log("EvtMgmtNodeCount from:" + fromTime + " to:" + toTime + " nodes:" + nodesFoundInAlertsCount);
			
			superMap = {
				all_nodes: allNodes,
                nodes_map: nodesMap,
                short_name2node: shortName2Node,
                server_cis: serverCis,
                other_cis: otherCis
            };

            var recordLimit = gs.getProperty("evt_mgmt.node_count.ci_record_limit", 100000);
            var isUnknownLicensable = gs.getProperty("evt_mgmt.is_unknown_licensable", true) == 'true';
            var batchUtil = new SNC.BatchCommandsUtil();

            var healthUtil = new sn_itom_license.ITOMLicensingHealthUtil("em_unique_nodes", superMap, recordLimit, isUnknownLicensable, alertManager, batchUtil);

            //add to serverCis list the CIs that match by name, IP or FQDN according to the nodes list
            healthUtil.populateServerList();

            //populate associated netork CIs, and add to server list in case it's derieved from server
            healthUtil.handleNetworkCIs();

            //populate all other CIs	
            healthUtil.handleOtherCis();
			
			//clear memory, not needed anymore
			allNodes = [];
			shortName2Node = {};

			var allCiIdsArray = [];  //allCiIdsArray contains all Cis from alerts
			var ciId;
			//don't use concat since every concat creates new object 		
			for(ciId in healthUtil.getServerCis()) 
				allCiIdsArray.push(ciId);	
			for(ciId in webAppCis) 
				allCiIdsArray.push(ciId);	
			for(ciId in healthUtil.getOtherCis()) 
				allCiIdsArray.push(ciId);	
			
            //Update the time of all the registered nodes that were found again in this calculation
            var unknownNodesMap = healthUtil.getValuesAsObj(healthUtil.getNodesMap());
			
			//clear memory, not needed anymore
			nodesMap = {};
            
            healthUtil.updateSuperMap("all_ciids", allCiIdsArray);
            healthUtil.updateSuperMap("unknown_nodes_map", unknownNodesMap);
            healthUtil.updateSuperMap("webapps_cis", webAppCis); // optional for the loom use case##

            healthUtil.updateTimeOfExistingNodes();

            //remove registered nodes from serverCis/webAppCis/unknownNodesMap so the insert will contain only new nodes to register
            healthUtil.removeRegisteredNodes();

            //add all the new CIs to the table
            insertCount += healthUtil.registerNewNodes();

            fromTime.addSeconds(periodSec);
            toTime.addSeconds(periodSec);

        }

        perfJson.totalNodesFoundInAlerts = nodesFoundInAlertsCount;
        perfJson.totalCisFoundInAlerts = cisFoundInAlertsCount;
        perfJson.totalAlertsWithWebCis = alertsWithWebCisCount;
        perfJson.nodesInsert = insertCount;

        gs.log("EvtMgmtNodeCount finished. total nodes:" + totalRowCount);
        var end = new Date().getTime();
        writeToPerfTable(totalRowCount, end - start, perfJson);

    },

    type: 'EvtMgmtNodeCount'
};
