/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Script: Set Actions

    if (api?.context?.session?.user?.sys_id)
        api.setState('userSysId', api.context.session.user.sys_id);

    if (!api.context.props.cabMeetingData)
        return;

    const actions = {};
    const currentUserSysId = api.context.session.user.sys_id;
    const record = api.context.props.cabMeetingData.record;
    const manager = record?.manager;
    const delegates = (!record?.delegates?.value) ? [] : record.delegates.value.split(',');
    const meetingState = record?.state.value;
    const currentHostSysId = api.context.props.currentHostSysId;

    // Host meeting check
    actions.hideHostButton = !(!isCABManager(currentUserSysId) && isCABDelegate(currentUserSysId) && (meetingState === 'pending' || meetingState == 'in_progress'));
    // Start meeting check
    actions.hideStartButton = !(meetingState === 'pending' && isCABManager(currentUserSysId));
    // End meeting check
    actions.hideEndButton = !(meetingState === 'in_progress' && isCABManager(currentUserSysId));
    // Open meeting check
    actions.hideOpenButton = !(isCABManager(currentUserSysId) || isCABDelegate(currentUserSysId));
    
    function isCABManager(userSysId) {
        if (currentHostSysId?.value)
            return currentHostSysId.value === userSysId;

        if (manager)
            return manager?.value === userSysId;

        return false;
    };

    function isCABDelegate(userSysId) {
        // If they're the CAB Manager, they're always a delegate
        if (manager && manager?.value === userSysId)
            return true;
        
        // If they're one of the delegates, they're a delegate
        if (delegates && delegates.indexOf(userSysId) > -1)
            return true;
        
        return false;
    };

    api.setState('actions', actions);
}
