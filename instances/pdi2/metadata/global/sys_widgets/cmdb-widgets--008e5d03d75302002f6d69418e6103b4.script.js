var domainId = gs.getUser().getDomainID();
if(GlideStringUtil.nil(domainId))
	domainId = "global";
var sysDomainQuery = '^sys_domain=' + domainId;

var metrics = {
	'Correctness': 'bbb6e75137130200f212cc028e41f13d',
	'Duplicate': 'e0172b5137130200f212cc028e41f14c',
	'Orphan': 'c6272b5137130200f212cc028e41f168',
	'Stale': 'd4772b5137130200f212cc028e41f16c',
	'Completeness': 'e4972b5137130200f212cc028e41f1ca',
	'Recommended': 'c7d72b5137130200f212cc028e41f1bd',
	'Required': 'bac72b5137130200f212cc028e41f1b8',
	'Compliance': 'e3a72b5137130200f212cc028e41f152',
	'Audit': '24f72b5137130200f212cc028e41f155',
	'Relationship' : 'c6f692757f33020009fedf92bdfa916b',
	'Stale Relationships' : 'c6f692757f33020009fedf92bdfa916b',
	'Orphan Relationships' : '4be692757f33020009fedf92bdfa916a',
	'Duplicate Relationships' : '93c692757f33020009fedf92bdfa9173'
};

// Sections metadata by type
var meta = {
	'cmdb_scorecard_overall': {
		url: '/$cmdb_scorecard.do?sysparm_type=overall'
	},
	'cmdb_scorecard_completeness': {
		url: '/$cmdb_scorecard.do?sysparm_type=completeness'
	},
	'cmdb_scorecard_compliance': {
		url: '/$cmdb_scorecard.do?sysparm_type=compliance'
	},
	'cmdb_scorecard_correctness': {
		url: '/$cmdb_scorecard.do?sysparm_type=correctness'
	},
	'cmdb_scorecard_relationship': {
		url: '/$cmdb_scorecard.do?sysparm_type=relationship'
	},
	'cmdb_chart_class_breakdown': {
		url: '/report_viewer.do?sysparm_table=cmdb_ci%26sysparm_title=CI%20Classes%26sysparm_field=sys_class_name%26sysparm_type=bar%26sysparm_manual_labor=true%26sysparm_aggregate=COUNT%26sysparm_query=sys_class_nameINSTANCEOFcmdb_ci'
	},

	//failed ci by classes
	'cmdb_report_result_duplicate_cis': {
		url: buildTotalMetricReportUrl('Duplicate')
	},
	'cmdb_report_result_orphan_cis': {
		url: buildTotalMetricReportUrl('Orphan')
	},
	'cmdb_report_result_stale_cis': {
		url: buildTotalMetricReportUrl('Stale')
	},
	'cmdb_report_result_audit_cis': {
		url: buildTotalMetricReportUrl('Audit')
	},
	'cmdb_report_result_recommended_cis': {
		url: buildTotalMetricReportUrl('Recommended')
	},
	'cmdb_report_result_required_cis': {
		url: buildTotalMetricReportUrl('Required')
	},


	'cmdb_report_relation_stale': {
		url: buildTotalRelationReportUrl('Stale Relationships')
	},
	'cmdb_report_relation_duplicate': {
		url: buildTotalRelationReportUrl('Duplicate Relationships')
	},
	'cmdb_report_relation_orphan': {
		url: buildTotalRelationReportUrl('Orphan Relationships')
	},

	//trend
	'cmdb_report_score_correctness_trend': {
		url: buildMetricTrendReportUrl('Correctness', 'score')
	},
	'cmdb_report_score_duplicate_trend': {
		url: buildMetricTrendReportUrl('Duplicate', 'failed')
	},
	'cmdb_report_score_orphan_trend': {
		url: buildMetricTrendReportUrl('Orphan', 'failed')
	},
	'cmdb_report_score_stale_trend': {
		url: buildMetricTrendReportUrl('Stale', 'failed')
	},
	'cmdb_report_score_completeness_trend': {
		url: buildMetricTrendReportUrl('Completeness', 'score')
	},
	'cmdb_report_score_recommended_trend': {
		url: buildMetricTrendReportUrl('Recommended', 'failed')
	},
	'cmdb_report_score_required_trend': {
		url: buildMetricTrendReportUrl('Required', 'failed')
	},
	'cmdb_report_score_compliance_trend': {
		url: buildMetricTrendReportUrl('Compliance', 'score')
	},
	'cmdb_report_score_audit_trend': {
		url: buildMetricTrendReportUrl('Audit','failed')
	},

	'ci_scorecard_completeness': {
		url: '/$ci_scorecard.do?sysparm_type=completeness'
	},
	'ci_scorecard_compliance': {
		url: '/$ci_scorecard.do?sysparm_type=compliance'
	},
	'ci_scorecard_correctness': {
		url: '/$ci_scorecard.do?sysparm_type=correctness'
	},
	'ci_scorecard_relationship': {
		url: '/$ci_scorecard.do?sysparm_type=relationship'
	},
	'ci_scorecard_relation_formatter': {
		url: '/relation_formatter_widget.do?'
	},
	'ci_list_tasklist': {
		url: '/$ci_widget_tasklist.do?'
	},
	'ci_timeline' : {
		url:'/$ci_dashboard_timeline.do?sysparm_widget=true&sysparm_drilldown=false'
	},
	'cmdb_toplist_incident' : {
		url:'/$cmdb_widget_countlist.do?sysparm_task=incident'
	},
	'cmdb_toplist_alert' : {
		url:'/$cmdb_widget_countlist.do?sysparm_task=em_alert'
	},
	'cmdb_toplist_change' : {
		url:'/$cmdb_widget_countlist.do?sysparm_task=change_request'
	},
	'cmdb_task_table_compliance': {
		url: '/task_list.do?sysparm_query=sys_class_name=cert_follow_on_task^cmdb_ci.sys_class_nameINSTANCEOF$class$^state=-5^ORstate=1^ORstate=2&sysparm_rows_per_page=5'
	},
	'cmdb_task_table_completeness': {
		url: '/task_list.do?sysparm_query=sys_class_name=recommended_field_remediation^cmdb_ci.sys_class_nameINSTANCEOFcmdb_ci^state=-5^ORstate=1^ORstate=2'+sysDomainQuery+'^NQsys_class_name=required_field_remediation^cmdb_ci.sys_class_nameINSTANCEOFcmdb_ci^state=-5^ORstate=1^ORstate=2&sysparm_rows_per_page=5'
	},
	'cmdb_task_table_correctness': {
		url: '/task_list.do?sysparm_query=sys_class_name=reconcile_duplicate_task^ORsys_class_name=stale_ci_remediation^cmdb_ci.sys_class_nameINSTANCEOFcmdb_ci^state=-5^ORstate=1^ORstate=2^NQsys_class_name=orphan_ci_remediation^cmdb_ci.sys_class_nameINSTANCEOFcmdb_ci^state=-5^ORstate=1^ORstate=2'+sysDomainQuery+'&sysparm_rows_per_page^5'
	},
	'cmdb_report_result_compliance_list': {
		url: 'cmdb_health_result_list.do?sysparm_rows_per_page=5&sysparm_query=active=true^metric=24f72b5137130200f212cc028e41f155'+sysDomainQuery
	},
	'cmdb_report_result_completeness_list': {
		url: 'cmdb_health_result_list.do?sysparm_rows_per_page=5&sysparm_query=active=true^metric=c7d72b5137130200f212cc028e41f1bd^ORmetric=bac72b5137130200f212cc028e41f1b8'+sysDomainQuery
	},
	'cmdb_report_result_correctness_list': {
		url: 'cmdb_health_result_list.do?sysparm_rows_per_page=5&sysparm_query=active=true^metric=e0172b5137130200f212cc028e41f14c^ORmetric=c6272b5137130200f212cc028e41f168^ORmetric=d4772b5137130200f212cc028e41f16c'+sysDomainQuery
	},
	'cmdb_hierarchy' : {
   		url: '/$cmdb_service_hierarchy.do?'
  	}
};

// Function to return available widget types
function sections() {
  var obj = {};
  // CMDB Scorecards
  obj[gs.getMessage('CMDB Health Scorecard')] 		= { 'type': 'cmdb_scorecard_overall' };
  obj[gs.getMessage('CMDB Compliance Scorecard')] 	= { 'type': 'cmdb_scorecard_compliance' };
  obj[gs.getMessage('CMDB Correctness Scorecard')]	= { 'type': 'cmdb_scorecard_correctness' };
  obj[gs.getMessage('CMDB Completeness Scorecard')]	= { 'type': 'cmdb_scorecard_completeness' };
  obj[gs.getMessage('CMDB CI Relationship Scorecard')] = { 'type': 'cmdb_scorecard_relationship' };
  obj[gs.getMessage('CMDB Class Breakdown')] = { 'type': 'cmdb_chart_class_breakdown' };

  // CI Scorecards
  obj[gs.getMessage('CI Compliance Scorecard')]  = { 'type': 'ci_scorecard_compliance' };
  obj[gs.getMessage('CI Correctness Scorecard')] = { 'type': 'ci_scorecard_correctness' };
  obj[gs.getMessage('CI Completeness Scorecard')] = { 'type': 'ci_scorecard_completeness' };
  obj[gs.getMessage('CI Relationship Scorecard')] = { 'type': 'ci_scorecard_relationship' };
  obj[gs.getMessage('CI Relationship Formatter')] = { 'type': 'ci_scorecard_relation_formatter' };

  // CMDB Drill Down Charts
  obj[gs.getMessage('Duplicate CIs')] = { 'type': 'cmdb_report_result_duplicate_cis' };
  obj[gs.getMessage('Orphan CIs')] = { 'type': 'cmdb_report_result_orphan_cis' };
  obj[gs.getMessage('Stale CIs')] = { 'type': 'cmdb_report_result_stale_cis' };
  obj[gs.getMessage('Recommended CIs')] = { 'type': 'cmdb_report_result_recommended_cis' };
  obj[gs.getMessage('Required CIs')] = { 'type': 'cmdb_report_result_required_cis' };
  obj[gs.getMessage('Audit CIs')] = { 'type': 'cmdb_report_result_audit_cis' };

  // CMDB Dashboard Relationship Charts
  obj[gs.getMessage('Stale Relationships')] = { 'type': 'cmdb_report_relation_stale' };
  obj[gs.getMessage('Orphan Relationships')] = { 'type': 'cmdb_report_relation_orphan' };
  obj[gs.getMessage('Duplicate Relationships')] = { 'type': 'cmdb_report_relation_duplicate' };

  // CMDB Dashboard List Widgets
  obj[gs.getMessage('Top 10 Incident Generators')] = { 'type': 'cmdb_toplist_incident' };
  obj[gs.getMessage('Top 10 Alert Generators')] = { 'type': 'cmdb_toplist_alert' };
  obj[gs.getMessage('Top 10 Change Generators')] = { 'type': 'cmdb_toplist_change' };

  // CMDB Trendlines
  obj[gs.getMessage('Correct CI Trend')] = { 'type': 'cmdb_report_score_correctness_trend' };
  obj[gs.getMessage('Duplicate CI Trend')] = { 'type': 'cmdb_report_score_duplicate_trend' };
  obj[gs.getMessage('Orphan CI Trend')] = { 'type': 'cmdb_report_score_orphan_trend' };
  obj[gs.getMessage('Stale CI Trend')] = { 'type': 'cmdb_report_score_stale_trend' };
  obj[gs.getMessage('Complete CI Trend')] = { 'type': 'cmdb_report_score_completeness_trend' };
  obj[gs.getMessage('Recommended CI Trend')] = { 'type': 'cmdb_report_score_recommended_trend' };
  obj[gs.getMessage('Required CI Trend')] = { 'type': 'cmdb_report_score_required_trend' };
  obj[gs.getMessage('Compliant CI Trend')] = { 'type': 'cmdb_report_score_compliance_trend' };
  obj[gs.getMessage('Audited CI Trend')] = { 'type': 'cmdb_report_score_audit_trend' };

  // CMDB Task Tables
  obj[gs.getMessage('CMDB Compliance Tasks')] = { 'type': 'cmdb_task_table_compliance'};
  obj[gs.getMessage('CMDB Completeness Tasks')] = { 'type': 'cmdb_task_table_completeness'};
  obj[gs.getMessage('CMDB Correctness Tasks')] = { 'type': 'cmdb_task_table_correctness'};

  // CMDB result list
  obj[gs.getMessage('CMDB Compliance Result List')] = { 'type': 'cmdb_report_result_compliance_list'};
  obj[gs.getMessage('CMDB Completeness Result List')] = { 'type': 'cmdb_report_result_completeness_list'};
  obj[gs.getMessage('CMDB Correctness Result List')] = { 'type': 'cmdb_report_result_correctness_list'};

  // CI Dashboard Widgets
  obj[gs.getMessage('CI Tasks')] = { 'type': 'ci_list_tasklist' };
  obj[gs.getMessage('CI Timeline')] = {'type' : 'ci_timeline'};

  // CMDB Hierarchy Widgets
  obj[gs.getMessage("CMDB Hierarchy")] = { "type" : "cmdb_hierarchy" };
  return obj;
}

function render() {
	// Get widget
	var widget = renderer.getPreferences().get('type');

	// Get widget type and title
	var type = null;
	var title = null;
	if(widget.indexOf('cmdb_scorecard') == 0) {
		type = 'cmdb_scorecard';
		if (widget == 'cmdb_scorecard_overall')
			title = gs.getMessage('CMDB Health Scorecard');
		else if (widget == 'cmdb_scorecard_compliance')
			title = gs.getMessage('CMDB Compliance Scorecard');
		else if (widget == 'cmdb_scorecard_correctness')
			title = gs.getMessage('CMDB Correctness Scorecard');
		else if (widget == 'cmdb_scorecard_completeness')
			title = gs.getMessage('CMDB Completeness Scorecard');
		else if (widget == 'cmdb_scorecard_relationship')
			title = gs.getMessage('CMDB CI Relationship Scorecard');
	} else if(widget.indexOf('cmdb_chart') == 0) {
		type = 'cmdb_chart';
		if (widget == 'cmdb_chart_class_breakdown')
			title = gs.getMessage('CMDB Class Breakdown');
	} else if(widget.indexOf('ci_scorecard') == 0) {
		type = 'ci_scorecard';
		if (widget == 'ci_scorecard_compliance')
			title = gs.getMessage('CI Compliance Scorecard');
		else if (widget == 'ci_scorecard_correctness' )
			title = gs.getMessage('CI Correctness Scorecard');
		else if (widget == 'ci_scorecard_completeness')
			title = gs.getMessage('CI Completeness Scorecard');
		else if (widget == 'ci_scorecard_relationship')
			title = gs.getMessage('CI Relationship Scorecard');
		else if (widget == 'ci_scorecard_relation_formatter')
			title = gs.getMessage('CI Relationship Formatter');
	} else if(widget.indexOf('cmdb_report_result') == 0) {
		type = 'cmdb_report_result';
		if (widget == 'cmdb_report_result_duplicate_cis')
			gs.getMessage('Duplicate CIs');
		else if (widget == 'cmdb_report_result_orphan_cis')
			title = gs.getMessage('Orphan CIs');
		else if (widget == 'cmdb_report_result_stale_cis')
			title = gs.getMessage('Stale CIs');
		else if (widget == 'cmdb_report_result_recommended_cis')
			title = gs.getMessage('Recommended CIs');
		else if (widget == 'cmdb_report_result_required_cis')
			title = gs.getMessage('Required CIs');
		else if (widget == 'cmdb_report_result_audit_cis')
			title = gs.getMessage('Audit CIs');
	} else if(widget.indexOf('cmdb_report_score') == 0) {
		type = 'cmdb_report_score';
		if (widget == 'cmdb_report_score_correctness_trend')
			title = gs.getMessage('Correct CI Trend');
		else if (widget == 'cmdb_report_score_duplicate_trend')
			title = gs.getMessage('Duplicate CI Trend');
		else if (widget == 'cmdb_report_score_orphan_trend')
			title = gs.getMessage('Orphan CI Trend');
		else if (widget == 'cmdb_report_score_stale_trend')
			title = gs.getMessage('Stale CI Trend');
		else if (widget == 'cmdb_report_score_completeness_trend')
			title = gs.getMessage('Complete CI Trend');
		else if (widget == 'cmdb_report_score_recommended_trend')
			title = gs.getMessage('Recommended CI Trend');
		else if (widget == 'cmdb_report_score_required_trend')
			title = gs.getMessage('Required CI Trend');
		else if (widget == 'cmdb_report_score_compliance_trend')
			title = gs.getMessage('Compliant CI Trend');
		else if (widget == 'cmdb_report_score_audit_trend')
			title = gs.getMessage('Audited CI Trend');
	} else if(widget.indexOf('cmdb_report_relation') == 0) {
		type = 'cmdb_report_relation';
		if (widget == 'cmdb_report_relation_stale')
			title = gs.getMessage('Stale Relationships');
		else if (widget == 'cmdb_report_relation_orphan')
			title = gs.getMessage('Orphan Relationships');
		else if (widget == 'cmdb_report_relation_duplicate')
			title = gs.getMessage('Duplicate Relationships');
	} else if(widget.indexOf('ci_list') == 0) {
		type = 'ci_list';
		title = gs.getMessage('CI Tasks');
	} else if(widget.indexOf('ci_timeline') == 0) {
		type = 'ci_timeline';
		title = gs.getMessage('CI Timeline');
	} else if(widget.indexOf('cmdb_toplist') == 0) {
		type = 'cmdb_toplist';
		if (widget == 'cmdb_toplist_incident')
			title = gs.getMessage('Top 10 Incident Generators');
		else if (widget == 'cmdb_toplist_alert')
			title = gs.getMessage('Top 10 Alert Generators');
		else if (widget == 'cmdb_toplist_change')
			title = gs.getMessage('Top 10 Change Generators');
	} else if(widget.indexOf('cmdb_task_table') == 0) {
		type = 'cmdb_task_table';
		if (widget == 'cmdb_task_table_compliance')
			title = gs.getMessage('CMDB Compliance Tasks');
		else if (widget == 'cmdb_task_table_completeness')
			title = gs.getMessage('CMDB Completeness Tasks');
		else if (widget == 'cmdb_task_table_correctness')
			title = gs.getMessage('CMDB Correctness Tasks');
	} else if(widget.indexOf('cmdb_hierarchy') == 0) {
		type = 'cmdb_hierarchy';
		title = gs.getMessage('CMDB Hierarchy');
	}

	// If type starts with CMDB scorecard...
	if(type == 'cmdb_scorecard' || type == 'cmdb_chart' || type == 'ci_scorecard'
	   || type == 'cmdb_report_result' || type == 'cmdb_report_score'
	   || type == 'cmdb_report_relation' || type == 'ci_list' || type == 'ci_timeline'
	   || type == 'cmdb_toplist' || type == 'cmdb_task_table' || type == 'cmdb_hierarchy') {

		// Get metadata for the widget
		var m = meta[widget];

		// Create a jelly runner to insert an iframe
		var jr = new GlideJellyRunner();
		renderer.getRenderProperties().setDeferInlineScripts(false);
		jr.setRenderProperties(renderer.getRenderProperties());
		jr.setTwoPhase(true);

		// Set the URL the iframe should have and other variables
		jr.setVariable('jvar_type', type);
		jr.setVariable('jvar_widget', widget);
		jr.setVariable('jvar_uid', randInt(100000, 999999) + '' + randInt(100000, 999999));
		jr.setVariable('jvar_url', m.url);
		jr.setVariable('jvar_title', title);
		// Get table and record context if provided
		var url = new GlideURL(renderer.getRenderProperties().getReferringURL());
		jr.setVariable('jvar_table', url.get('sysparm_table'));
		jr.setVariable('jvar_record', url.get('sysparm_record'));

		// Run a template that returns the iframe
		return jr.runFromTemplate('cmdb_widget_iframe.xml');
	} else {
		// Default to NOOP
		return 'Invalid widget type';
	}
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildReportUrl(title, table, type, query, groupby) {
	var AND = '&';
	var params = '/report_viewer.do?';
	params += 'sysparm_table=' + table;
	params += AND + 'sysparm_type=' + type;
	params += AND + 'sysparm_field=' + groupby;
	params += AND + 'sysparm_title=' + title;
	params += AND + 'sysparm_manual_labor=true';
	params += AND + 'sysparm_aggregate=COUNT';
	params += AND + 'sysparm_others=10';
	params += AND + 'sysparm_show_other=false';
	params += AND + 'sysparm_query=' + query;

	return params;
}

function buildTrendReportUrl(title, table, type, query, sumField, trendField, trendInterval) {
	var AND = '&';
	var params = '/report_viewer.do?';
	params += 'sysparm_table=' + table;
	params += AND + 'sysparm_type=' + type;
	params += AND + 'sysparm_field=';
	params += AND + 'sysparm_title=' + title;
	params += AND + 'sysparm_aggregate=AVG';
	params += AND + 'sysparm_sumfield=' + sumField;
	params += AND + 'sysparm_trend_field=' + trendField;
	params += AND + 'sysparm_trend_interval=' + trendInterval;
	params += AND + 'sysparm_manual_labor=true';
	params += AND + 'sysparm_others=10';
	params += AND + 'sysparm_show_other=false';
	params += AND + 'sysparm_query=' + query;

	return params;
}

function buildMetricTrendReportUrl(name, sumField) {
	var metricSysId = metrics[name];
	return buildTrendReportUrl(name + 'CIs trend', 'cmdb_health_scorecard', 'line', 'metric=' + metricSysId +'^status=HISTORIC^class=$class$'+sysDomainQuery, sumField, 'evaluated_on', 'date');
}

function buildTotalMetricReportUrl(name) {
	var metricSysId = metrics[name];
	return buildReportUrl('Total '+name+' CIs', 'cmdb_health_result', 'bar', 'metric='+metricSysId+'^active=true'+sysDomainQuery, 'class_name');
}

function buildTotalRelationReportUrl(name) {
	var metricSysId = metrics[name];
	return buildReportUrl('Total ' + name, 'relation_health_result', 'bar', 'active=true^metric='+metricSysId+sysDomainQuery, 'relation.type');
}

function getEditLink() {
        return '';
}
