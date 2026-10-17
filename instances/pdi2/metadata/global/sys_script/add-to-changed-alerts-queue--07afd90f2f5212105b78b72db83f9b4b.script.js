(function executeRule(current, previous /*null when async*/ ) {

    if (!current || gs.getProperty('sn_em_ai.alert_crawler_jobs_enabled', true) === 'false')
        return;

    var alertCrawlerUtilsAPI = new sn_em_ai.EvtMgmtAlertCrawlerAPI();
    var evtMgmtCommons = new global.EvtMgmtCommons();

    var prevParent = previous.getValue("parent");
    var currParent = current.getValue("parent");
    var alertDomain = evtMgmtCommons.getRecordDomain(current);
    var additionalInfo = {};
    if (prevParent != currParent) { // parent changed
        // check for secondary log analytics alerts- for these alerts we'll need to get the "grandparent" if the parent's role is both primary and secondary
        additionalInfo[alertCrawlerUtilsAPI.isLaAlertValue()] = !gs.nil(current.sn_extra_data);
        if (currParent) { //add to group
            alertCrawlerUtilsAPI.addToAlertsQueue(current.sys_id, currParent, current.cmdb_ci, "", alertCrawlerUtilsAPI.alertAddedToGroup(), JSON.stringify(additionalInfo), alertDomain);
        }
        if (prevParent) { //no current parent for alert - alert is removed from group and not added to another
            alertCrawlerUtilsAPI.addToAlertsQueue(current.sys_id, prevParent, current.cmdb_ci, current.getValue("sn_alert_tags"), alertCrawlerUtilsAPI.alertRemovedFromGroup(), JSON.stringify(additionalInfo), alertDomain);
        }
    }
	if (previous.getValue("sn_alert_tags") != current.getValue("sn_alert_tags")) { // alert tags changed
        alertCrawlerUtilsAPI.addToAlertsQueue(current.sys_id, "", "", current.getValue("sn_alert_tags"), alertCrawlerUtilsAPI.alertTagsChanged(), JSON.stringify(additionalInfo), alertDomain);
    }
	if (previous.getValue("cmdb_ci") != current.getValue("cmdb_ci")) { // ci changed
        additionalInfo[alertCrawlerUtilsAPI.isLaAlertValue()] = !gs.nil(current.sn_extra_data);
        additionalInfo[alertCrawlerUtilsAPI.isGroupedAlertValue()] = (current.getValue('correlation_group') != 0);
        alertCrawlerUtilsAPI.addToAlertsQueue(current.sys_id, currParent, current.getValue("cmdb_ci"), "", alertCrawlerUtilsAPI.alertCiChanged(), JSON.stringify(additionalInfo), alertDomain);
    }

})(current, previous);
