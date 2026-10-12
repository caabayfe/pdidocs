var CITopicRecommendationsUtil = Class.create();
CITopicRecommendationsUtil.prototype = {
    initialize: function() {},

    getTaxonomyIntentTopics: function() {
        var gr = new GlideRecord('sn_topic_recommend_taxonomy_topic');
        gr.addQuery('topic_sys_policy', 'read');
        gr.query();
        var models = {};
        var intents;
        var intent;
        var languages;
        var intentTopic;
        while (gr.next()) {
            intentTopic = {
                intent: gr.getValue('taxonomy_taxonomy_intent'),
                model: gr.getValue('taxonomy_taxonomy_model'),
                nluIntentId: gr.getValue('intent_sys_id'),
                nluIntentName: gr.getValue('intent_name'),
                nluModelId: gr.getValue('model_sys_id'),
                nluModelName: gr.getValue('model_name'),
                language: gr.getValue('taxonomy_language'),
                topicId: gr.getValue('topic_sys_id'),
                topicName: gr.getValue('topic_name'),
                topicDescription: gr.getValue('topic_description'),
                csTopicId: gr.getValue('cstopic_sys_id'),
                topicIsActive: gr.getValue('cstopic_active')
            };
            intents = models[intentTopic.model] || {};
            intent = intents[intentTopic.intent] || {};
            languages = intent.languages || {};
            languages[intentTopic.language] = intentTopic;
            intent.languages = languages;
            intents[intentTopic.intent] = intent;
            models[intentTopic.model] = intents;
        }
        return models;
    },

    getInstalledTopics: function() {

        var topics = {};
        var topic;
        var installedTopics = {};

        // Get all topics installed through Topic Recommendation - linking table
        var installedGr = new GlideRecord('sn_topic_recommend_topic_linking');
        installedGr.addQuery('type', 'added');
        installedGr.query();
        while (installedGr.next()) {
            topic = {
                id: installedGr.getValue('topic'),
                taxonomy: installedGr.getValue('taxonomy'),
                intent: installedGr.getValue('intent'),
                installedDate: installedGr.topic.sys_created_on.toString(),
                name: installedGr.topic.name.toString(),
                csTopicId: null,
                topicIsActive: false
            };
            topics[topic.taxonomy] = topics[topic.taxonomy] || {};
            topics[topic.taxonomy][topic.intent] = topic;
            installedTopics[topic.id] = {
                taxonomy: topic.taxonomy,
                intent: topic.intent
            };
        }

        // Get all topics installed through Topic Recommendation - staging table
        installedGr = new GlideRecord('sn_topic_recommend_topic_staging');
        installedGr.addNotNullQuery('topic_clone.sys_id');
        var statusCondition = installedGr.addQuery('status', 'complete');
        statusCondition.addOrCondition('status', 'warning');
        installedGr.orderByDesc('sys_updated_on');
        installedGr.query();
        while (installedGr.next()) {
            topic = {
                id: installedGr.getValue('topic_clone'),
                taxonomy: installedGr.getValue('taxonomy'),
                intent: installedGr.getValue('intent'),
                installedDate: installedGr.topic_clone.sys_created_on.toString(),
                name: installedGr.topic_clone.name.toString(),
                csTopicId: null,
                topicIsActive: false
            };
            topics[topic.taxonomy] = topics[topic.taxonomy] || {};
            if (!topics[topic.taxonomy][topic.intent]) {
                topics[topic.taxonomy][topic.intent] = topic;
                installedTopics[topic.id] = {
                    taxonomy: topic.taxonomy,
                    intent: topic.intent
                };
            }
        }

        var installedTopicIds = Object.keys(installedTopics);
        var associatedCSTopicGr = new GlideRecord('sys_cs_topic');
        associatedCSTopicGr.addQuery('cb_topic_id', 'IN', installedTopicIds);
        associatedCSTopicGr.addQuery('published', true);
        associatedCSTopicGr.query();
        while (associatedCSTopicGr.next()) {

            var topicId = associatedCSTopicGr.getValue('cb_topic_id');
            var csTopicId = associatedCSTopicGr.getValue('sys_id');
            var isActive = associatedCSTopicGr.getValue('active') === '1';
            var installedTopic = installedTopics[topicId];

            topics[installedTopic.taxonomy][installedTopic.intent].csTopicId = csTopicId;
            topics[installedTopic.taxonomy][installedTopic.intent].topicIsActive = isActive;

        }


        // Get all other topics installed through Intent cloning
        installedGr = new GlideRecord('sn_topic_recommend_taxonomy_topic');
        installedGr.addQuery('taxonomy_type', 'CUSTOM');
        installedGr.addNullQuery('topic_sys_policy');
        installedGr.orderBy('topic_created_on');
        installedGr.query();
        while (installedGr.next()) {
            topic = {
                id: installedGr.getValue('topic_sys_id'),
                taxonomy: installedGr.getValue('taxonomy_taxonomy_model'),
                intent: installedGr.getValue('taxonomy_taxonomy_intent'),
                installedDate: installedGr.getValue('topic_sys_created_on'),
                name: installedGr.getValue('topic_name'),
                csTopicId: installedGr.getValue('cstopic_sys_id'),
                topicIsActive: installedGr.getValue('cstopic_active')
            };
            topics[topic.taxonomy] = topics[topic.taxonomy] || {};
            topics[topic.taxonomy][topic.intent] = topics[topic.taxonomy][topic.intent] || topic;
        }
        return topics;
    },

    getLinkedTopics: function() {
        var gr = new GlideRecord('sn_topic_recommend_topic_linking');
        gr.addQuery('type', 'linked');
        gr.query();
        var topics = {};
        var linkedTopic;
        var topicLinks = {};
        while (gr.next()) {
            linkedTopic = {
                linkedId: gr.getUniqueValue(),
                linkedDate: gr.sys_created_on.toString(),
                taxonomy: gr.getValue('taxonomy'),
                intent: gr.getValue('intent'),
                topicId: gr.getValue('topic'),
                topicName: gr.topic.name.toString(),
                csTopicId: null,
                topicIsActive: false
            };
            topics[linkedTopic.taxonomy] = topics[linkedTopic.taxonomy] || {};
            topics[linkedTopic.taxonomy][linkedTopic.intent] = linkedTopic;
            var taxonomyIntent = {
                taxonomy: linkedTopic.taxonomy,
                intent: linkedTopic.intent
            };
            topicLinks[linkedTopic.topicId] = topicLinks[linkedTopic.topicId] ? topicLinks[linkedTopic.topicId].concat(taxonomyIntent) : [taxonomyIntent];
        }

        var linkedTopicIds = Object.keys(topicLinks);
        var associatedCSTopicGr = new GlideRecord('sys_cs_topic');
        associatedCSTopicGr.addQuery('cb_topic_id', 'IN', linkedTopicIds);
        associatedCSTopicGr.addQuery('published', true);
        associatedCSTopicGr.query();
        while (associatedCSTopicGr.next()) {
            var topicId = associatedCSTopicGr.getValue('cb_topic_id');
            var csTopicId = associatedCSTopicGr.getValue('sys_id');
            var isActive = associatedCSTopicGr.getValue('active') === '1';
            var links = topicLinks[topicId];
            for (index = 0; index < links.length; index++) {
                var link = links[index];
                topics[link.taxonomy][link.intent].csTopicId = csTopicId;
                topics[link.taxonomy][link.intent].topicIsActive = isActive;
            }
        }

        return topics;
    },

    getUnviewedReports: function(reportType) {
        var gr = new GlideRecord('sn_topic_recommend_view_status');
        gr.addQuery('viewed', false);
        gr.addQuery('report_type', reportType);
        gr.query();
        var unviewedReports = {};
        while (gr.next()) {
            unviewedReports[gr.getValue('report_id')] = true;
        }
        return unviewedReports;
    },

    getUnviewedReportGenerations: function(unviewedGenerations) {
        var gr = new GlideAggregate('sn_topic_recommend_topic_staging');
        gr.groupBy('generation_id');
        gr.groupBy('report');
        gr.groupBy('topic_clone');
        gr.addQuery('status', 'complete');
        gr.query();
        var topicsAdded = {};
        var reportId;
        var generationId;
        while (gr.next()) {
            reportId = gr.getValue('report');
            generationId = gr.getValue('generation_id');
            topicsAdded[reportId] = topicsAdded[reportId] || 0;
            if (unviewedGenerations[generationId]) {
                topicsAdded[reportId] += 1;
            }
        }
        return topicsAdded;
    },

    initializeReport: function(reportId, gr, unviewed, newTopicCount) {
        var requestId = gr.getValue('request_sys_id');
        return {
            id: reportId,
            requestId: requestId,
            requestsHandled: 0,
            requestsUnhandled: parseInt(gr.getValue('rep_unmatched_count') || 0),
            totalRequests: parseInt(gr.getValue('rep_message_count') || 0),
            recommendations: [],
            status: gr.getValue('request_status'),
            taxonomy: gr.getValue('request_model'),
            table: gr.getValue('request_table'),
            displayFilter: gr.getDisplayValue('request_filter'),
            createdDate: gr.getValue('request_sys_created_on'),
            updatedDate: gr.getValue('request_sys_updated_on'),
            viewed: !unviewed[requestId],
            topicsAdded: newTopicCount[reportId] || 0
        };
    },

    generateReports: function() {
        var installedIntents = this.getInstalledTopics();
        var linkedTopics = this.getLinkedTopics();
        var unviewedReports = this.getUnviewedReports('analysis');
        var unviewedTopics = this.getUnviewedReports('generation');
        var newTopicCounts = this.getUnviewedReportGenerations(unviewedTopics);

        var hits = new GlideAggregate('sn_topic_recommend_intent_report');
        hits.addAggregate('sum', 'imsg_count');
        hits.orderByDesc('request_sys_created_on');
        hits.orderBy('request_sys_id');
        hits.orderBy('rep_sys_id');
        hits.groupBy('request_status');
        hits.groupBy('request_model');
        hits.groupBy('request_sys_updated_on');
        hits.groupBy('request_table');
        hits.groupBy('request_filter');
        hits.groupBy('intent_sys_id');
        hits.groupBy('rep_unmatched_count');
        hits.groupBy('rep_message_count');
        hits.orderBy('intent_name');
        hits.query();
        var reports = [];

        var report = {};

        while (hits.next()) {
            var requestId = hits.getValue('request_sys_id');
            var reportId = hits.getValue('rep_sys_id');
            var status = hits.getValue('request_status');
            var taxonomy = hits.getValue('request_model');
            var table = hits.getValue('request_table');
            var matchesCount = hits.getAggregate('sum', 'imsg_count');
            var matches = parseInt(matchesCount || 0);
            if (reportId != report.id || requestId != report.requestId) {
                report = this.initializeReport(reportId, hits, unviewedReports, newTopicCounts);
                reports.push(report);
            }
            var intentName = hits.getValue('intent_name');
            var intentId = hits.getValue('intent_sys_id');
            var installed = installedIntents[taxonomy] && installedIntents[taxonomy][intentName];
            var linked = linkedTopics[taxonomy] && linkedTopics[taxonomy][intentName];

            if (matches > 0) {
                report.recommendations.push({
                    intent: intentName,
                    reportId: reportId,
                    intentId: intentId,
                    matches: matches,
                    installed: !!installed,
                    installedId: installed ? installed.id : null,
                    installedDate: installed ? installed.installedDate : null,
                    installedName: installed ? installed.name : null,
                    topicIsActive: installed ? installed.topicIsActive : (linked ? linked.topicIsActive : false),
                    csTopicId: installed ? installed.csTopicId : (linked ? linked.csTopicId : null),
                    linkedId: linked ? linked.linkedId : null,
                    linkedDate: linked ? linked.linkedDate : null,
                    linkedTopicId: linked ? linked.topicId : null,
                    linkedTopicName: linked ? linked.topicName : null
                });
            }

            report.requestsHandled += matches;
        }

        return reports;
    },

    type: 'CITopicRecommendationsUtil'
};
