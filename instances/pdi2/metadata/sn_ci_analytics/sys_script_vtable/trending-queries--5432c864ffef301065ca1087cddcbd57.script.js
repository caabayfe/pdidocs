(function executeQuery(v_table, v_query) {
    var va = new sn_ci_analytics.VADashboardUserSearchMetrics();
    va.execute(v_table, v_query, "trending_queries");
})(v_table, v_query);
