var EvtMgmtAlertsInGroupAPI = Class.create();
EvtMgmtAlertsInGroupAPI.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'EvtMgmtAlertsInGroupAPI',
    GROUP_ROLES: {
        PRIMARY: '1',
        SECONDARY: '2',
        PRIMARY_AND_SECONDARY: '3'
    },
    EM_ALERT_COLUMNS: {
        CORRELATION_GROUP: 'correlation_group',
        CORRELATION_RULE_GROUP: 'correlation_rule_group',
        TABLE_NAME: 'em_alert',
        PARENT: 'parent',
        SYS_ID: 'sys_id',
        GROUP_SOURCE: 'group_source',
        CMDB: 'cmdb_ci',
        SOURCE: 'source'
    },
    GROUP_SOURCES: {
        AUTOMATED: '1',
        RULE_BASED: '2',
        MANUAL: '3',
        CMDB: '4',
        TEXT_BASED: '8',
        LOG_ANALYTICS_GROUP: '9',
        TAG_CLUSTER: '11'
    },

    SOURCES: {
        LOG_ANALYTICS: 'Log Analytics'
    },

    ADDITIONAL_INFO_KEYS: {
        SN_BOUND_CIS_IDS: 'sn_bound_cis_ids'
    },

    initialize: function() {},

    getRelatedAlertsByGroup: function(alertId) {
        var resultAlertsGR = new GlideRecord(this.EM_ALERT_COLUMNS.TABLE_NAME);
        var alertGR = new GlideRecord(this.EM_ALERT_COLUMNS.TABLE_NAME);
        if (alertGR.get(alertId)) {
            var alertGroup = alertGR.getValue(this.EM_ALERT_COLUMNS.CORRELATION_GROUP);
            var alertGroupType = alertGR.getValue(this.EM_ALERT_COLUMNS.CORRELATION_RULE_GROUP);
            var alertParent = alertGR.getValue(this.EM_ALERT_COLUMNS.PARENT);
			var alertGroupSource = alertGR.getValue(this.EM_ALERT_COLUMNS.GROUP_SOURCE);

            this.addConditionsToGroupQuery(alertId, resultAlertsGR, alertGroup, alertGroupType, alertParent, alertGroupSource);
            resultAlertsGR.query();
            return {
                alert: alertGR,
                alerts: resultAlertsGR
            };
        }
        return null;
    },

    addConditionsToGroupQuery: function(alertId, resultAlertGR, alertGroup, alertGroupType, alertParent, groupSource) {
        var orGR = null;
        switch (alertGroup) {
            case this.GROUP_ROLES.PRIMARY:
                //add all the alerts which have this alert as their parent
                orGR = resultAlertGR.addQuery(this.EM_ALERT_COLUMNS.PARENT, alertId);
                //if not virtual alert nor log analytics group, add myself to the results
				
                if (alertGroupType == this.GROUP_ROLES.PRIMARY &&
                    groupSource !== this.GROUP_SOURCES.LOG_ANALYTICS_GROUP &&
 		    groupSource !== this.GROUP_SOURCES.TAG_CLUSTER) {
                    //add the current alert
                    orGR.addOrCondition(this.EM_ALERT_COLUMNS.SYS_ID, alertId);
                }
                break;
            case this.GROUP_ROLES.SECONDARY:
            case this.GROUP_ROLES.PRIMARY_AND_SECONDARY:
                //add all the other alerts that have the same parent
                orGR = resultAlertGR.addQuery(this.EM_ALERT_COLUMNS.PARENT, alertParent);
                if (alertGroupType == this.GROUP_ROLES.SECONDARY) {
                    //add also the parent
                    orGR.addOrCondition(this.EM_ALERT_COLUMNS.SYS_ID, alertParent);
                }
                break;
        }
        if (orGR === null) { //if there is no condition, return zero results
            resultAlertGR.addQuery(this.EM_ALERT_COLUMNS.PARENT, '=', '');
            resultAlertGR.addQuery(this.EM_ALERT_COLUMNS.PARENT, '!=', '');
        }
    },

    // get the bound configuration items ids for Log Analytics alert
    getAlertBoundCisIds: function(alertGr) {
        var alertSource = alertGr.getValue(this.EM_ALERT_COLUMNS.SOURCE);
        if (alertSource == this.SOURCES.LOG_ANALYTICS) {
            try {
                var additionalInfo = JSON.parse(alertGr.additional_info);
            } catch (e) {
                gs.error('EvtMgmtAlertsInGroupAPI: Error parsing additional_info for alert ' + alertGr.getValue(this.EM_ALERT_COLUMNS.SYS_ID) + ': ' + e);
                return [];
            }
            if (additionalInfo.hasOwnProperty(this.ADDITIONAL_INFO_KEYS.SN_BOUND_CIS_IDS)) {
                var alertBoundCisIds = additionalInfo[this.ADDITIONAL_INFO_KEYS.SN_BOUND_CIS_IDS];
                if (alertBoundCisIds) {
                    return alertBoundCisIds.split(',');
                }
            }
        }
        return [];
    },

    getTheCIsOfMyGroup: function(alertId) {
        // we are only interested in CIs of the alert and below (up to 2 levels)
        // split to 2 queries for better performance
        // in the 1st query we can't use group by CI since we need Role field
        // in the 1st query we can't use CI not empty filter since alerts on top or middle levels can have empty CI
        // 1st query (alert itself and his direct children)
        var allAlertCis = new GlideAggregate("em_alert");
        allAlertCis.addQuery(this.EM_ALERT_COLUMNS.SYS_ID, alertId)
            .addOrCondition(this.EM_ALERT_COLUMNS.PARENT, alertId);
        allAlertCis.query();
        var cisOfAlertsInGroup = [];
        var bothAlerts = [];
        while (allAlertCis.next()) {
            var ci = allAlertCis.getValue(this.EM_ALERT_COLUMNS.CMDB);
            if (ci) {
                cisOfAlertsInGroup.push(ci);
            }
			cisOfAlertsInGroup = cisOfAlertsInGroup.concat(this.getAlertBoundCisIds(allAlertCis));
            var role = allAlertCis.getValue(this.EM_ALERT_COLUMNS.CORRELATION_GROUP);
            if (role == this.GROUP_ROLES.PRIMARY_AND_SECONDARY) {
                var sysId = allAlertCis.getValue("sys_id");
                bothAlerts.push(sysId);
            }
        }
        // 2nd query (grandchildren) - only if really needed
        if (bothAlerts.length > 0) {
            allAlertCis = new GlideAggregate("em_alert");
            allAlertCis.addQuery(this.EM_ALERT_COLUMNS.PARENT, "IN", bothAlerts);
            allAlertCis.addQuery(this.EM_ALERT_COLUMNS.CMDB, "!=", null);
            allAlertCis.groupBy(this.EM_ALERT_COLUMNS.CMDB);
            allAlertCis.query();
            while (allAlertCis.next()) {
                ci = allAlertCis.getValue(this.EM_ALERT_COLUMNS.CMDB);
                cisOfAlertsInGroup.push(ci);
            }
        }
        // remove duplicate CIs since we could not use group by CI
        return this.uniq(cisOfAlertsInGroup);
    },

    uniq: function(a) {
        var prims = {
                "boolean": {},
                "number": {},
                "string": {}
            },
            objs = [];
        return a.filter(function(item) {
            var type = typeof item;
            if (type in prims)
                return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
            else
                return objs.indexOf(item) >= 0 ? false : objs.push(item);
        });
    },

    getImpactedServicesForAlert: function(alertId) {
        var cis = this.getTheCIsOfMyGroup(alertId);
        var alertManager = new SNC.AlertManager();
        return alertManager.getImpactedServicesByCis(cis);
    },

    getAlertsGroupDetails: function(alertId, alertsInGroupRes, excludeMetrics, excludeCIsInGroup) {
        var groupPrimary = null;
        var numberOfAlertsWithCI = 0;
        var groupSource = null;
        var arrayAlerts = [];

        if (!excludeMetrics || !excludeCIsInGroup) {
            while (alertsInGroupRes.next()) {
                if (!excludeMetrics) {
                    if (!gs.nil(alertsInGroupRes.getValue(this.EM_ALERT_COLUMNS.CMDB))) {
                        numberOfAlertsWithCI++;
                    }

                    // Expecting only one record to be primary
                    if (groupSource === null && alertsInGroupRes.getValue(this.EM_ALERT_COLUMNS.CORRELATION_RULE_GROUP) === this.GROUP_ROLES.PRIMARY) {
                        groupSource = alertsInGroupRes.getValue(this.EM_ALERT_COLUMNS.GROUP_SOURCE);
                    }
                }

                if (!excludeCIsInGroup) {
                    arrayAlerts.push(alertsInGroupRes.getUniqueValue());
                }
            }
        }

        //if group is cmdb or automatic or text based the group type will be on the parent
        if (!excludeMetrics && groupSource === null) {
            var parentGR = new GlideRecord(this.EM_ALERT_COLUMNS.TABLE_NAME);
            var parent = alertsInGroupRes.getValue(this.EM_ALERT_COLUMNS.PARENT);
            parentGR.get(parent);
            groupSource = parentGR.getValue(this.EM_ALERT_COLUMNS.GROUP_SOURCE);
        }

        var result = {
            alerts: arrayAlerts,
            metrics: excludeMetrics ? {} : {
                membersCount: alertsInGroupRes.getRowCount(),
                reasoning: this.getGroupReasoning(groupSource),
                numberOfAlertsWithCI: numberOfAlertsWithCI
            },
            cisInGroup: this.getTheCIsOfMyGroup(alertId)
        };

        return result;
    },

    getGroupReasoning: function(groupSource) {
        var result = '';
        if (!gs.nil(groupSource)) {
            switch (groupSource) {
                case this.GROUP_SOURCES.AUTOMATED:
                    result = gs.getMessage('Correlated alerts based on a learned pattern');
                    break;
                case this.GROUP_SOURCES.RULE_BASED:
                    result = gs.getMessage('Correlated alerts based on an alert correlation rule');
                    break;
                case this.GROUP_SOURCES.MANUAL:
                    result = gs.getMessage('Manually created group of alerts');
                    break;
                case this.GROUP_SOURCES.CMDB:
                    result = gs.getMessage('Correlated alerts based on CIs\' relationships in the CMDB');
                    break;
                case this.GROUP_SOURCES.TEXT_BASED:
                    result = gs.getMessage('Correlated alerts based on text similarity');
                    break;
            }
        }
        return result;
    }
});

EvtMgmtAlertsInGroupAPI.get = function() {
    return new EvtMgmtAlertsInGroupAPI();
};
