/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    const {
        name,
        payload
    } = event;
    const form = api.data.glide_form_add_event.nowRecordFormBlob.gForm;
    const DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
    let startDateTime = api.data.dateRangeConverter.output.startDateTime;
    let endDateTime = api.data.dateRangeConverter.output.endDateTime;
    api.setState('isLoading', false);
    
    /*if date is converted from date string to schedule date time, then dont show on UI, so no formatting(its only for backend call)
     * if date is converted from schedule date time to date string, then show it on date range picker
     * ***When date is converted by Date Converter from ScheduleDateTime to String, it is in user format
     */
    if (api.state.isConvertToScheduleDateTime) {
        form.setValue('start_date_time', startDateTime);
        form.setValue('end_date_time', endDateTime);
    } else if (startDateTime && endDateTime) {
        const userDateFormat = api.context.session.user.dateFormat.replaceAll('d', 'D').replaceAll('y', 'Y');
        const userDateTimeFormat = api.context.session.user.dateTimeFormat.replaceAll('d', 'D').replaceAll('y', 'Y').replaceAll('a', 'A');
        const curFormat = api.state.allDay ? userDateFormat : userDateTimeFormat;

        const formattedStartTime = NowDateTime(startDateTime, userDateTimeFormat).format(curFormat);
        const formattedEndTime = NowDateTime(endDateTime, userDateTimeFormat).format(curFormat);

        api.setState('formattedStartDateTime', formattedStartTime);
        api.setState('formattedEndDateTime', formattedEndTime);
        api.setState('startDateTime', NowDateTime(startDateTime, userDateTimeFormat).format(DEFAULT_DATETIME_FORMAT));
        api.setState('endDateTime', NowDateTime(endDateTime, userDateTimeFormat).format(DEFAULT_DATETIME_FORMAT));
    }

}
