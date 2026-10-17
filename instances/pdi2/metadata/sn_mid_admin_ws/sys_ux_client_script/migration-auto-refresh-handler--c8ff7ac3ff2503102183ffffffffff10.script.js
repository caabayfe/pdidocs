/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Check if refresh cycle is already running
    if (api.state.migrationRefreshActive) {
        console.log('[migration-auto-refresh] Auto-refresh cycle already active, skipping');
        return;
    }
    
    // Show info notification that migration has started
    var message = await helpers.translate(
        'migration_auto_refresh_started',
        'Migration started - list will auto-refresh every 15 seconds'
    );
    
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'migration_auto_refresh_started',
            status: 'info',
            icon: 'circle-info-outline',
            content: {
                type: 'string',
                value: message
            },
            action: {
                type: 'dismiss'
            }
        }]
    });
    
    // Set up interval to refresh every 15 seconds
    console.log('[migration-auto-refresh] Starting auto-refresh cycle (every 15 seconds)');
    var intervalId = helpers.timing.setInterval(function() {
        console.log('[migration-auto-refresh] Refreshing migration list...');
        if (api.data && api.data.get_ipki_migration_list_rows) {
            api.data.get_ipki_migration_list_rows.refresh();
        }
    }, 15000); // 15 seconds

    // Mark refresh cycle as active
    api.setState('migrationRefreshActive', true);
}
