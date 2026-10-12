function process(record) {
    // Add your code here
    if (record.getTable() === "par_visualization") {
        record.setUrl("/now/platform-analytics-workspace/visualization-designer/" + record.getSysId() + "?");
    } else if (record.getTable() === "par_dashboard") {
        record.setUrl("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/" + record.getSysId() + "?");
    } else if (record.getTable() === "pa_indicators") {
        record.setUrl("/now/platform-analytics-workspace/ac_kpi_details/" + record.getSysId() + "?");
    } else if (record.getTable() === "par_component_filter") {
        record.setUrl("/now/platform-analytics-workspace/filter-designer/" + record.getSysId() + "?");
    } else if (record.getTable() === "sysauto_par") {
        record.setUrl("/now/platform-analytics-workspace/scheduled-export/" + record.getSysId() + "?");
    } 

    return;
}
