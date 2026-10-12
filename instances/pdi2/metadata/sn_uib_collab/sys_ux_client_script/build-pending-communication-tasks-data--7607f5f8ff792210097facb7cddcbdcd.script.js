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
    const dropdownLabel = {
        'close': await helpers.translate('Close'),
        'start': await helpers.translate('Start Task'),
        'snooze': await helpers.translate('Snooze'),
        'view_record': await helpers.translate('View Record'),
        'manage_participants': await helpers.translate('Manage Participants')
    };

    const calculateDuration = (date) => {
        if (!date) return '';
        return Math.abs(Date.parse(date) - Date.now());
    };

    const addLeadingZero = (number) => (number >= 10 ? number : '0' + number);
    const isOverdue = (date) => (Date.parse(date) < Date.now());
    const isSlackCollaboration = (channelType) => (channelType == 'slack-channel-chat');
    const isTeamsCollaboration = (channelType) => (channelType == 'ms-teams-group-chat');
    const isSidebarCollaboration = (channelType) => (channelType == 'sidebar-discussion');

    const formatDuration = (milliseconds) => {
        if (!milliseconds) return '';
        let timeInSeconds = (milliseconds / 1000);
        let secs = addLeadingZero(Math.floor(timeInSeconds % 60));
        let mins = addLeadingZero(Math.floor((timeInSeconds / 60) % 60));
        let hrs = addLeadingZero(Math.floor((timeInSeconds / 60 / 60) % 24));

        let formattedDuration = hrs + ':' + mins + ':' + secs;
        if (timeInSeconds >= 24 * 60 * 60) {
            formattedDuration = addLeadingZero(Math.floor(timeInSeconds / 24 / 60 / 60)) + ':' + formattedDuration;
        }

        return formattedDuration;
    };

    const buildDropdownObject = (action) => {
        return {
            id: action,
            label: dropdownLabel[action]
        };
    };

    const buildDropdownOptions = (commTask) => {
        let options = [];
        if (commTask.canStart) options.push(buildDropdownObject('start'));
        if (commTask.canSnooze) options.push(buildDropdownObject('snooze'));
        if (commTask.permissions.manage_recipients) options.push(buildDropdownObject('manage_participants'));
        options.push(buildDropdownObject('view_record'));
        if (commTask.canClose) options.push(buildDropdownObject('close'));
        return options;
    };

    const canPerformCommTask = (commTask, channelType) => {
        if (isSidebarCollaboration(channelType)) return commTask.canInitiateSidebarDiscussion;
        return commTask.isCollabLeader;
    };

    const buildCommTaskMetadata = (commTask) => {
        const dueDate = commTask.due_date.value ? (commTask.due_date.value + 'Z') : '';
        let channelType = (commTask.channels && commTask.channels.length > 0 &&
            commTask.channels[0].channelType && commTask.channels[0].channelType.value) ? commTask.channels[0].channelType.value : '';

        return {
            sys_id: commTask.sys_id.value,
            table: commTask.sys_class_name.value,
            description: commTask.short_description.display_value,
            state: commTask.channels[0].state.display_value,
            comm_plan: commTask.commPlanDisplayName,
            comm_plan_sys_id: commTask.commPlanSysId,
            type: commTask.channels[0].channelType.value,
            recipients: commTask.recipients,
            due_in: {
                due_date: dueDate,
                display_value: formatDuration(calculateDuration(dueDate))
            },
            is_overdue: isOverdue(dueDate),
            can_perform_task: canPerformCommTask(commTask, channelType),
            overflow_options: buildDropdownOptions(commTask),
            is_slack_collaboration: isSlackCollaboration(channelType),
            is_teams_collaboration: isTeamsCollaboration(channelType),
            is_sidebar_collaboration: isSidebarCollaboration(channelType)
        };
    };

    const commTasks = api.context.props.pendingCommTasks;
    let formattedCommTasks = [];
    for (let index in commTasks) {
        if (commTasks[index].collabType != 'chat') continue;
        formattedCommTasks.push(buildCommTaskMetadata(commTasks[index]));
    }
    formattedCommTasks.sort((a, b) => Date.parse(a.due_in.due_date) - Date.parse(b.due_in.due_date));

    api.setState('formattedPendingTasks', formattedCommTasks);
    if (formattedCommTasks.length > 0) api.setState('loading', true);

    if (api.state.timerIntervalId)
        helpers.timing.clearInterval(api.state.timerIntervalId);

    const timerIntervalId = helpers.timing.setInterval(() => {
        for (let index in formattedCommTasks) {
            const dueDate = formattedCommTasks[index].due_in.due_date;
            formattedCommTasks[index].is_overdue = isOverdue(dueDate);
            formattedCommTasks[index].due_in.display_value = formatDuration(calculateDuration(dueDate));
        }
        api.setState('formattedPendingTasks', [...formattedCommTasks]);
    }, 1000);
    api.setState('timerIntervalId', timerIntervalId);
    api.emit('COLLAB_UIB#REFRESH_SEARCH_AND_FILTER_ARRAY');
}
