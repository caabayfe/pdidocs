/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var currentModal = api.state.currentModal;
    if (currentModal === 'scheduled' && (!api.state.scheduleDateTime || api.state.scheduleDateTime === 'null')) {
        return;
    }

    var map = {
        schedule: 'scheduled',
        upgrade: 'updated'
    };

    if (currentModal === "deleteSchedule") {
        return helpers.translateSync( "Schedule of the selected apps will be deleted if exists, Do you want to continue?" );
    }

    let action = map[currentModal];
    
    return helpers.translateSync( "Selected apps will be {0}, Do you want to continue?",[action] );
}
