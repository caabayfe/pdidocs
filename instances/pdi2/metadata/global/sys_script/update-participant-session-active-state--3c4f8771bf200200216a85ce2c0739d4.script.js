function onAfter(current, previous) {
    var session = getParticipantSessionForCall(current);
    if (session == null)
            return;
    
    if (session.active != current.active) {
        if (session.active) {
            try {
                var now = new GlideDateTime();
                var duration = new GlideDuration(gs.dateDiff(current.getDisplayValue('sys_created_on'), now.getDisplayValue()));
                session.setValue('duration', duration.getValue());
            }
            catch (e) {
                gs.log('could not calculate participant session duration ' + e);
            }
        }
        session.setValue('active', current.active);
        session.update();
    }
}
/**
 * Get the participant session record for this call
 *
 * @param call
 * @returns {*}
 */
function getParticipantSessionForCall(call) {
    var session = new GlideRecord('notify_participant_session');
    session.query('notify_call', call.getUniqueValue());
    if (session.next()) {
        return session;
    }
    return null;
}
