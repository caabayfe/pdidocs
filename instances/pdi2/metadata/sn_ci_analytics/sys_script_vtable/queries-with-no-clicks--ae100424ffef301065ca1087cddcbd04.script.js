(function executeQuery(v_table, v_query) {
    var va = new sn_ci_analytics.VADashboardUserSearchMetrics();
    va.execute(v_table, v_query, "queries_with_no_clicks");
})(v_table, v_query);
