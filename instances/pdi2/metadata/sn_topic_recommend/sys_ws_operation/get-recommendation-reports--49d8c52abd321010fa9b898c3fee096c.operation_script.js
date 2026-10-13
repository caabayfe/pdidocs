(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	function getUnviewedReports(reportType) {
		var gr = new GlideRecord('sn_topic_recommend_view_status');
		gr.addQuery('viewed', false);
		gr.addQuery('report_type', reportType);
		gr.query();
		var unviewedReports = {};
		while (gr.next()) {
			unviewedReports[gr.getValue('report_id')] = true;
		}
		return unviewedReports;
	}
	
	function getUnviewedReportGenerations(unviewedGenerations) {
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
	}
	
	function initializeReport(reportId, gr, unviewed, newTopicCount) {
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
	}
	
	var installedIntents = new sn_topic_recommend.RecommendationUtil().getInstalledTopics();
	var linkedTopics = new sn_topic_recommend.RecommendationUtil().getLinkedTopics();
	var ignoredIntents = new sn_topic_recommend.RecommendationUtil().getIgnoredIntents();
	var unviewedReports = getUnviewedReports('analysis');
	var unviewedTopics = getUnviewedReports('generation');
	var newTopicCounts = getUnviewedReportGenerations(unviewedTopics);
	
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
			report = initializeReport(reportId, hits, unviewedReports, newTopicCounts);
			reports.push(report);
		}
		var intentName = hits.getValue('intent_name');
		var intentId = hits.getValue('intent_sys_id');
		var installed = installedIntents[taxonomy] && installedIntents[taxonomy][intentName];
		var linked = linkedTopics[taxonomy] && linkedTopics[taxonomy][intentName];
		var ignored = ignoredIntents[taxonomy] && ignoredIntents[taxonomy][intentName];
		
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
                                linkedTopicName: linked ? linked.topicName : null,
				ignoredId: ignored ? ignored.ignoredId : null,
				ignored: !!ignored
			});
		}
		
		report.requestsHandled += matches;
	}
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(reports);

})(request, response);
