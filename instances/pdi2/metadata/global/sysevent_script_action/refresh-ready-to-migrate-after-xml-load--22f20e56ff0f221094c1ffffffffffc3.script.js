 // tables that can affect dashboard migratability
    var RELEVANT = {
        'pa_m2m_dashboard_tabs': 1,
        'pa_tabs'              : 1,
        'sys_portal'           : 1,
        'sys_portal_preferences':1
    };

    var touched = (event.parm1 || '').split(',');
    var shouldRecalc = false;

    for (var i = 0; i < touched.length; i++) {
        if (RELEVANT[touched[i].trim()]) {
            shouldRecalc = true;
            break;
        }
    }

    if (shouldRecalc) {
        var migrator = new PopulateReadyToMigrate();
        migrator.populateAllDashboardsReadyToMigrateColumns();
        gs.info('COREUI_MIGRATION: ready_to_migrate refreshed after update-set load');
    } else {
        gs.debug('COREUI_MIGRATION: XML load touched no relevant tables; skipping refresh');
    }
	
