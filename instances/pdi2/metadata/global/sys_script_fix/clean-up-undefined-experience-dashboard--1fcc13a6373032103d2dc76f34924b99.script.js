(function() {
    gs.info('COREUI_MIGRATION: Starting cleanup of "undefined" values in experience_dashboard field');

    // Query for dashboards with "undefined" string values
    var dashboardGR = new GlideRecord('pa_dashboards');
    dashboardGR.addQuery('experience_dashboard', 'undefined');
    dashboardGR.query();

    if (!dashboardGR.hasNext()) {
        gs.info('COREUI_MIGRATION: No "undefined" values found in experience_dashboard field - cleanup not needed');
        return;
    }

    gs.info('COREUI_MIGRATION: Found dashboards with "undefined" experience_dashboard values, starting cleanup...');

    while (dashboardGR.next()) {
        dashboardGR.setValue('experience_dashboard', '');

        var updateResult = dashboardGR.update();
        if (!updateResult) {
            gs.warn('COREUI_MIGRATION: Failed to update dashboard ' + dashboardGR.getUniqueValue() + ' during undefined cleanup');
        }
    }

    gs.info('COREUI_MIGRATION: Cleanup completed');

})();
