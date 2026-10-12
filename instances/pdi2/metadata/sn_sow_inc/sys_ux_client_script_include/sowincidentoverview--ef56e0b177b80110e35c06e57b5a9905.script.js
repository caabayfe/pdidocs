function include({
    imports
}) {
    let sowIncidentOverviewSNC = imports['sn_sow_inc.SowIncidentOverviewSNC']();
    class SowIncidentOverview extends sowIncidentOverviewSNC {

    }
    return SowIncidentOverview;
}
