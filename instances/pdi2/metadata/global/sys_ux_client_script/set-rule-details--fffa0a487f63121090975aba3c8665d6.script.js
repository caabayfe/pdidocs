/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var rulesArray = api.data.transform_all_rules_for_a_table.output;
    rulesArray.sort((a, b) => {
        const order = {
            "Active": 1,
            "scheduled": 2,
            "new": 3
        };

        const aRank = order[a.status] || 4; // Default rank for others
        const bRank = order[b.status] || 4;
        return aRank - bRank;
    });

    var activeRulesCount = 0;
    var inactiveRulesCount = 0;
    const stringsMap = {
        "Archive": await helpers.translate("Archive"),
        "Cleanup": await helpers.translate("Cleanup"),
        "Onetime delete": await helpers.translate("Onetime delete"),
        "Active": await helpers.translate("Active"),
        "Inactive": await helpers.translate("Inactive"),
        "new": await helpers.translate("New"),
        "scheduled": await helpers.translate("Scheduled"),
        "running": await helpers.translate("Running"),
        "cancelled": await helpers.translate("Cancelled"),
        "complete": await helpers.translate("Complete"),
        "rolled_back": await helpers.translate("Rolled back")
    };

    var rows = rulesArray.map((rule, index) => {
        if (rule.status == "Active" || rule.status == "scheduled") {
            activeRulesCount++;
        } else {
            inactiveRulesCount++;
        }

        var recordsInBacklog = "-";
        if (rule.recordsInBacklog != null) recordsInBacklog = rule.recordsInBacklog;

        function getRuleName(rule) {
            if (rule.name && rule.name.trim().length > 0) {
                return rule.name;
            }
            if (rule.type == "TABLE_CLEANER") {
                return rule.tableName + " " + rule.sysId;
            }
            return rule.number;
        }

        function getStatusMessage(status) {
            return stringsMap[status];
        }

        function getRuleTypeMessage(ruleType) {
            if (ruleType == "ARCHIVE") {
                return stringsMap["Archive"];
            } else if (ruleType == "TABLE_CLEANER") {
                return stringsMap["Cleanup"];
            } else if (ruleType == "ONE_TIME_DELETE") {
                return stringsMap["Onetime delete"];
            }
        }

        return {
            "cells": {
                "recordsInBacklog": {
                    "value": recordsInBacklog
                },
                "rule": {
                    "ruleId": rule.sysId,
                    "value": getRuleName(rule),
                    "ruleType": rule.type,
                    "tableName": rule.tableName,
                },
                "status": {
                    "highlightedValue": {
                        "color": (rule.status == "Active" || rule.status == "scheduled") ? "positive" : "low",
                        "value": stringsMap[rule.status]
                    }
                },
                "type": {
                    "value": getRuleTypeMessage(rule.type)
                }
            },
            "key": "rowKey" + index
        };
    });
    api.setState("ruleCount", rulesArray.length);
    api.setState("activeRulesCount", activeRulesCount);
    api.setState("inactiveRulesCount", inactiveRulesCount);
    api.setState("ruleListRows", {
        "rows": rows
    });
}
