(function executeRule(current, previous /*null when async*/ ) {
    // Insert or update the visualization metadata
    new global.AnalyticsCenterUtil().updateMetadataRecords('analytics_visualization_metadata', current, 'visualization');
})(current, previous);
