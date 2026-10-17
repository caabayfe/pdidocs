function transform(){
    var response = {};
    response["events_dashboard"] = gs.hasRole("events_dashboard_viewer");
    response["scheduler_dashboard"] = gs.hasRole("scheduler_dashboard_viewer");
    return response;
}
