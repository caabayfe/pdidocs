var IntentDiscoveryReportUtil = Class.create();
IntentDiscoveryReportUtil.prototype = {
    initialize: function() {},
    createReportFromJson: function(definitionId, reportName, baseTable, fieldName, parsedJson, domain) {
        function isNoIntentMatched(intentId) {
            return intentId === "NO_INTENT_MATCHED";
        }

        function collectBreakdowns(data) {

            function limitBreakdown(obj) {
                var limit = 20;
                if (Object.keys(obj).length <= limit) {
                    return obj;
                }

                var newArray = [];
                Object.keys(obj).forEach(function(key) {
                    newArray.push({
                        key: key,
                        value: obj[key]
                    });
                });

                var topValues = newArray.sort(function(a, b) {
                    return b.value.pct - a.value.pct;
                }).slice(0, limit);

                var result = {};
                topValues.forEach(function(val) {
                    result[val.key] = val.value;
                });
                return result;
            }

            var breakdowns = {};
            if (data.assignment_group) {
                // assignment_group's keys are sys_ids, swap the sys_ids for labels
                var assignmentGroupData = limitBreakdown(data.assignment_group);
                var sysIds = Object.keys(assignmentGroupData);
                var updatedAssignmentGroup = {};
                for (var u = 0; u < sysIds.length; u++) {
                    var key = getAssignmentGroupNameIfAvailable(sysIds[u]);
                    updatedAssignmentGroup[key] = assignmentGroupData[sysIds[u]];
                }
                breakdowns.assignment_group = updatedAssignmentGroup;
            }
            if (data.state) {
                // states keys are ints, swap the ints for labels. State can be customized for each table. 
                var state = limitBreakdown(data.state);
                var stateNumbers = Object.keys(state);
                var updatedState = {};
                for (var u = 0; u < stateNumbers.length; u++) {
                    var key = getStateLabelIfAvailable(baseTable, stateNumbers[u]);
                    updatedState[key] = state[stateNumbers[u]];
                }
                breakdowns.state = updatedState;
            }
            if (data.contact_type) {
                breakdowns.contact_type = limitBreakdown(data.contact_type);
            }
            if (data.language) {
                breakdowns.language = limitBreakdown(data.language);
            }

            return breakdowns;
        }

        function getAssignmentGroupNameIfAvailable(sysID) {
            var gr = new GlideRecord("sys_user_group");
            if (gr.get(sysID)) {
                return gr.getValue("name");
            }
            return sysID;
        }

        function getStateLabelIfAvailable(table, stateNumber) {
            var gr = new GlideRecord("sys_choice");
            gr.addQuery("name", table);
            gr.addQuery("element", "state");
            gr.addQuery("value", stateNumber);
            gr.query();
            if (gr.next()) {
                gs.info("found value found for state: " + stateNumber + " table: " + table);
                return gr.getValue("label");
            }
            gs.info("NO value found for state: " + stateNumber + " table: " + table);
            return stateNumber;
        }


        function createIntent(reportId, intentData) {
            if (!isNoIntentMatched(intentData.id)) {
                gs.debug("[DISC] Processing intent ID" + intentData.id);
                var intent = new GlideRecord("sn_nlu_discovery_intent");
                var intentId;
                var intentName = intentData.id;
                intent.addQuery("report", reportId);
                intent.addQuery("name", intentName);
                intent.query();
                intent.next();
                if (intent.getRowCount() === 0) {
                    intent = new GlideRecord("sn_nlu_discovery_intent");
                    gs.info("creating intent" + intentName);
                    intent.initialize();
                    intent.name = intentName;
                    intent.report = reportId;
                    intent.sys_domain = domain;
                    if (intentData.clusters && intentData.clusters[0]) {
                        intent.breakdowns = JSON.stringify(collectBreakdowns(intentData.clusters[0]));
                    }
                    intentId = intent.insert();
                } else {
                    gs.debug("intent name already exists " + intentName);
                    combineBreakDownForIntents(reportId, intent, "language", intentData);
                    combineBreakDownForIntents(reportId, intent, "state", intentData);
                    combineBreakDownForIntents(reportId, intent, "contact_type", intentData);
                    combineBreakDownForIntents(reportId, intent, "assignment_group", intentData);
                    intent.update();
                    intentId = intent.getUniqueValue();
                }
                createMessages(reportId, intentId, null, intentData.clusters[0]);
            } else {
                // NO_INTENT_MATCHED clusters
                for (var i = 0; i < intentData.clusters.length; i++) {
                    createCluster(reportId, intentData.clusters[i]);
                }
            }
        }

        function combineBreakDownForIntents(reportId, intent, key, intentData) {
            var existingBreakDown = collectBreakdowns(intentData.clusters[0])
            var msgs = new GlideRecord('sn_nlu_discovery_processed_message');
            msgs.addQuery("report", reportId);
            msgs.addQuery("intent", intent.getUniqueValue());
            msgs.query();
            var existingMessageCount = 0;
            while (msgs.next()) {
                existingMessageCount = existingMessageCount + parseInt(msgs.getValue("count"));
            }
            var newMessagesCount = 0;
            for (var i = 0; i < (intentData.clusters[0] || {}).messages.length; i++) {
                newMessagesCount = newMessagesCount + parseInt(intentData.clusters[0].messages[i].count);
            }
            // make sure we grab keys from both source intent and the intent we are combining
            // example: one intent has fr and another en, both would be sub keys of lang.
            var subKeysList = Object.keys(((intentData.breakdowns || {})[key] || {}));
            Object.keys(existingBreakDown[key] || {}).forEach(function(subKey) {
                if (subKeysList.indexOf(subKey) === -1) {
                    subKeysList.push(subKey);
                }
            });
            // combine breakdowns
            subKeysList.forEach(function(subKey) {
                var newMatchingMessages
                if (!((existingBreakDown || {})[key] || {})[subKey]) {
                    newMatchingMessages = 0;
                } else {
                    newMatchingMessages = ((existingBreakDown[key][subKey]["pct"] / 100.0) * newMessagesCount)
                }

                gs.debug("Number of new messages for sub key " + subKey + ": " + newMatchingMessages);

                var existingMatchingMessages;
                if (!((existingBreakDown[key] || {})[subKey] || {})["pct"]) {
                    existingMatchingMessages = 0;
                    // add the key if it doesn't exist
                    // This means source intent may not have stats about state, lang etc...
                    if (!existingBreakDown[key]) {
                        existingBreakDown[key] = {};
                    }
                    existingBreakDown[key][subKey] = {
                        "pct": 0
                    };
                } else {
                    gs.debug("existing breakdown " + existingBreakDown[key][subKey]["pct"] + " existingMessageCount: " + existingMessageCount);
                    existingMatchingMessages = ((existingBreakDown[key][subKey]["pct"] / 100.0) * existingMessageCount);
                }

                gs.debug("Existing matching messages: " + existingMatchingMessages + " newMessagesCount" + newMessagesCount + "existing message count" + existingMessageCount);
                // (total number of messages that match)/totalNumber
                var percent = ((newMatchingMessages + existingMatchingMessages) / (newMessagesCount + existingMessageCount)) * 100.0;
                gs.debug("Updated percent: " + percent);
                existingBreakDown[key][subKey]["pct"] = percent;
            });
            intent.breakdowns = JSON.stringify(existingBreakDown);
            gs.debug("updated breakdown " + JSON.stringify(existingBreakDown));
            intent.update();
        }


        function createCluster(reportId, clusterData) {
            var cluster = new GlideRecord('sn_nlu_discovery_cluster');
            cluster.initialize();
            cluster.report = reportId;
            cluster.sys_domain = domain;
            cluster.breakdowns = JSON.stringify(collectBreakdowns(clusterData));
            var clusterId = cluster.insert();

            createMessages(reportId, null, clusterId, clusterData);
        }

        function createMessages(reportId, intentSysID, clusterId, clusterData) {
            for (var i = 0; i < clusterData.messages.length; i++) {
                try {
                    var message = new GlideRecord('sn_nlu_discovery_processed_message');
                    message.initialize();
                    if (intentSysID != null) {
                        message.intent = intentSysID;
                    } else {
                        message.cluster = clusterId;
                    }
                    message.count = clusterData.messages[i].count;
                    message.sys_domain = domain;
                    message.language = clusterData.messages[i].language;

                    if (baseTable && fieldName && clusterData.messages[i].id) {
                        message.table = baseTable;
                        message.field = fieldName;
                        if (('' + clusterData.messages[i].id).length <= 32) {
                            message.record_id = clusterData.messages[i].id;
                        } else {
                            gs.warn('[DISC] Report message ID is invalid. id=' + clusterData.messages[i].id);
                        }
                    } else {
                        var reason = !clusterData.messages[i].id ? 'Record ID is missing' : (!baseTable ? 'source table is not set' : 'field name is not set');
                        gs.warn('[DISC] Report message cannot be saved since ' + reason + ', id=' + clusterData.messages[i].id);
                    }
                    message.insert();
                } catch (e) {
                    gs.error('[DISC] Error processing cluster message: ' + e.message + ', ' + JSON.stringify(e));
                }
            }
        }

        try {
            gs.debug('[DISC] ReportUtil called: definitionId=' + definitionId + ', reportName=' + reportName + ', baseTable=' + baseTable + ', fieldName=' + fieldName + ', jsonData=' + ('' + parsedJson.toString()).substring(0, 100) + '...');

            var report = new GlideRecord('sn_nlu_discovery_report');
            report.initialize();
            report.name = reportName;
            report.definition = definitionId;
            report.sys_domain = domain;
            report.message_count = parsedJson.totalMessages;
            var reportSysID = report.insert();

            var intents = parsedJson.intents;
            for (var i = 0; i < (intents || []).length; i++) {
                createIntent(reportSysID, intents[i]);

                if (isNoIntentMatched(intents[i].id)) {
                    report.unmatched_count = intents[i].totalNumMessages;
                }
            }
            report.update();
            gs.debug('[DISC] ReportUtil report created id=' + reportSysID);
            return reportSysID;
        } catch (e) {
            gs.warn('[DISC] Error creating report from JSON:' + e.message + '\n' + e);
        }
    },
    type: 'IntentDiscoveryReportUtil'
};
