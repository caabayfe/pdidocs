var SOWUpcomingLinkProvider_Incidents = Class.create();
SOWUpcomingLinkProvider_Incidents.prototype = {
    type: 'SOWUpcomingLinkProvider_Incidents',
    initialize: function() {},
    _buildLink: function(gr, count, msg, listTitle, icon) {
        var route = {
            route: 'simplelist',
            fields: {
                table: gr.getTableName()
            },
            params: {
                listTitle: listTitle,
                query: gr.getEncodedQuery()
            }
        };
        if (1 == count) {
            route = {
                route: 'record',
                fields: {
                    table: gr.getTableName(),
                    sysId: gr.getUniqueValue()
                }
            };
        }
        var item = {
            label: msg,
            type: 'route',
            value: route,
            "startsWith": {
                "icon": icon,
                "align": "center"
            },
            "endsWith": {
                "type": "icon",
                "value": "link-outline",
                "additionalAttrs": null
            },
            "opensWindow": false,
            "configAria": {},
            "download": false
        };
        return item;
    },
    process: function(request, fromDateTime, toDateTime, assginToQuery) {
        // Return array of objects per the link set api
        // https://developer.servicenow.com/dev.do#!/reference/now-experience/quebec/shared-components/now-link-set/api
        var PREFIX_QUERY = 'active=true^' + assginToQuery;
        var SLA_AT_RISK_TODAY_QUERY = '^JOINincident.sys_id=task_sla.task!planned_end_timeONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()';
        var SLA_AT_RISK_TOMORROW_QUERY = '^JOINincident.sys_id=task_sla.task!planned_end_timeONTomorrow@javascript:gs.beginningOfTomorrow()@javascript:gs.endOfTomorrow()';
        var SLA_AT_RISK_SUFFIX_QUERY_HAS_BREACHED_FALSE = '^JOINincident.sys_id=task_sla.task!has_breached=false';
        var SLA_AT_RISK_SUFFIX_QUERY_ACTIVE_TRUE = '^JOINincident.sys_id=task_sla.task!active=true';
        var SLA_AT_RISK_SUFFIX_QUERY_STAGE_PAUSED = '^JOINincident.sys_id=task_sla.task!stage!=paused';
        var SLA_BREACH_SUFFIX_QUERY = '^JOINincident.sys_id=task_sla.task!has_breached=true';
        var encodedSlaAtRiskQuery = null;
        var encodedSlaBreachQuery = null;
        var listTitle = gs.getMessage("Incident SLAs");
        if ('beginningOfToday' == request.from && 'endOfToday' == request.to) {
            encodedSlaAtRiskQuery = PREFIX_QUERY + SLA_AT_RISK_TODAY_QUERY + SLA_AT_RISK_SUFFIX_QUERY_HAS_BREACHED_FALSE + SLA_AT_RISK_SUFFIX_QUERY_ACTIVE_TRUE + SLA_AT_RISK_SUFFIX_QUERY_STAGE_PAUSED;
            encodedSlaBreachQuery = PREFIX_QUERY + SLA_BREACH_SUFFIX_QUERY;
        } else if ('beginningOfTomorrow' == request.from && 'endOfTomorrow' == request.to) {
            encodedSlaAtRiskQuery = PREFIX_QUERY + SLA_AT_RISK_TOMORROW_QUERY + SLA_AT_RISK_SUFFIX_QUERY_HAS_BREACHED_FALSE + SLA_AT_RISK_SUFFIX_QUERY_ACTIVE_TRUE + SLA_AT_RISK_SUFFIX_QUERY_STAGE_PAUSED;
        } else {
            throw gs.getMessage("Unsupported date range");
        }
        var LIMIT = 10;
        var gr = new GlideRecordSecure('incident');
        gr.addEncodedQuery(encodedSlaAtRiskQuery, false);
        gr.setLimit(LIMIT + 1);
        gr.query();
        var count = gr.next() ? gr.getRowCount() : 0;
        var items = [];
        if (count > 0) {
            var msg = null;
            if (1 == count) {
                msg = sn_i18n.Message.getMessage("sn_sow_inc", "{count} incident with SLA at risk", {
                    count: count.toString()
                });
            } else {
                if (count > LIMIT) {
                    msg = sn_i18n.Message.getMessage("sn_sow_inc", "More than {count} incidents with SLA at risk", {
                        count: LIMIT.toString()
                    });
                } else {
                    msg = sn_i18n.Message.getMessage("sn_sow_inc", "{count} incidents with SLA at risk", {
                        count: count.toString()
                    });
                }
            }
            items.push(this._buildLink(gr, count, msg, listTitle, "clock-outline"));
        }
        if (false == gs.nil(encodedSlaBreachQuery)) {
            var breachGr = new GlideRecordSecure('incident');
            breachGr.addEncodedQuery(encodedSlaBreachQuery, false);
            gr.setLimit(LIMIT + 1);
            breachGr.query();
            var breachCount = breachGr.next() ? breachGr.getRowCount() : 0;
            if (breachCount > 0) {
                var breachMsg = null;
                if (1 == breachCount) {
                    breachMsg = sn_i18n.Message.getMessage("sn_sow_inc", "{count} incident with breached SLA", {
                        count: breachCount.toString()
                    });
                } else {
                    if (breachCount > LIMIT) {
                        breachMsg = sn_i18n.Message.getMessage("sn_sow_inc", "More than {count} incidents with breached SLA", {
                            count: LIMIT.toString()
                        });
                    } else {
                        breachMsg = sn_i18n.Message.getMessage("sn_sow_inc", "{count} incidents with breached SLA", {
                            count: breachCount.toString()
                        });
                    }
                }
                items.push(this._buildLink(breachGr, breachCount, breachMsg, listTitle, "exclamation-triangle-outline"));
            }
        }
        return items;
    }
};
