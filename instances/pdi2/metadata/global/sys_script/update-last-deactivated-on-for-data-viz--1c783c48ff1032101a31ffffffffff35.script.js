(function executeRule(current, previous /*null when async*/ ) {
    new global.AnalyticsCenterUtil().updateLastDeactivatedOn('analytics_visualization_metadata', current, 'visualization');

})(current, previous);
