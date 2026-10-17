if (gs.getUser().hasRole("sn_sd.success_dashboard_admin")) {
    var grObj = new GlideRecord("sys_db_object");

    if (grObj.get("name", "sn_sd_kpi_category")) {
        var grKpiCategory = new GlideRecord("sn_sd_kpi_category");
        grKpiCategory.addQuery("dashboard_type", "operational_success");
        grKpiCategory.query();
        
        if (grKpiCategory.next()) {
            answer = true;
        } else {
            answer = false;
        }
    } else {
        answer = false;
    }
} else {
    answer = false;
}
