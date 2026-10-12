(function executeRule(current, previous /*null when async*/ ) {
    var util = new global.AnalyticsCenterUtil();
    util.updateLastDeactivatedOn('analytics_dashboard_metadata', current, 'dashboard');
    util.updateLastDeactivatedOn('par_dashboard_user_metadata', current, 'dashboard');

})(current, previous);
