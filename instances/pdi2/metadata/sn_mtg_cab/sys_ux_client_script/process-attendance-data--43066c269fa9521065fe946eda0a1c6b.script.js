/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    // Script: Process Attendance Data

    if (!api.context.props.userData?.attendanceStatus || !api.context.props.userData?.attendanceStatus.value)
        return;

    let attendanceStatusColor = '';
    switch (api.context.props.userData.attendanceStatus.value) {
        case 'attending':
            attendanceStatusColor = 'green';
            break;
        case 'not_attending':
            attendanceStatusColor = 'critical';
            break;
        case 'no_response':
            attendanceStatusColor = 'gray';
            break;
        case 'tentative':
            attendanceStatusColor = 'blue';
            break;
        default:
            attendanceStatusColor = 'gray';
    }

    api.setState('attendanceStatusColor', attendanceStatusColor);
}
