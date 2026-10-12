function transform(input) {
    var table = input.tableName;
    var result = {
        canICreateArtifacts: false,
    };

	if (!table) {
		return {
			accessControls: {
				par_dashboard: {
					can_create: new global.AnalyticsCenterUtil().canICreateDashboard()
				},
				par_visualization: {
					can_create: new global.AnalyticsCenterUtil().canICreateDataVisualization()
				},
				pa_indicators: {
					can_create: new global.AnalyticsCenterUtil().canICreatePAIndicators()
				},
				par_component_filter: {
					can_create: new global.AnalyticsCenterUtil().canICreatePARComponentFilter()
				},
				sysauto_par: {
					can_create: new global.AnalyticsCenterUtil().canICreatePARScheduledReport()
				}
			}
		};
	}

    if (table === 'par_dashboard')
        result.canICreateArtifacts = new global.AnalyticsCenterUtil().canICreateDashboard();

    else if (table === 'par_visualization')
        result.canICreateArtifacts = new global.AnalyticsCenterUtil().canICreateDataVisualization();

    else if (table === 'pa_indicators')
        result.canICreateArtifacts = new global.AnalyticsCenterUtil().canICreatePAIndicators();
	
    else if (table === 'par_component_filter')
        result.canICreateArtifacts = new global.AnalyticsCenterUtil().canICreatePARComponentFilter();
	
    else if (table === 'sysauto_par')
        result.canICreateArtifacts = new global.AnalyticsCenterUtil().canICreatePARScheduledReport();

    return result;
}
