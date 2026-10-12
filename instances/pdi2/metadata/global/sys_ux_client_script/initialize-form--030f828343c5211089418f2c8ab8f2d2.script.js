/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 * ASSUMPTION : state variables startdate and enddatetime will always be readable datetime string in default formatYYYY-MM-DD HH:mm:ss
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    const {
        convertTimezone
    } = imports['global.TimeZoneUtil']();
    const {
        getTranslationConstants
    } = imports['global.GetRepeatSummary']();
    const initializeFormParameters = () => {
        api.setState('startDateTime', '');
        api.setState('formattedStartDateTime', '');
        api.setState('endDateTime', '');
        api.setState('formattedEndDateTime', '');
        api.setState('inputStartDateTime', '');
        api.setState('inputEndDateTime', '');
        api.setState('repeatType', '');
        api.setState('errorMessage', '');
        api.setState('allDay', false);
        api.setState('doesNotRepeatDropDownId', '');
        api.setState('repeatCountValue', 1);
        api.setState('monthlyType', "dom");
        api.setState('yearlyType', "doy");
        api.setState('floatWeekValue', "1");
        api.setState('floatDayValue', "1");
        api.setState('monthValue', "1");
        api.setState('repeatUntilValue', '');
        api.setState('formattedRepeatUntilValue', '');
        api.setState('daysOfWeek', {
            "mon_box": true,
            "tue_box": false,
            "wed_box": false,
            "thu_box": false,
            "fri_box": false,
            "sat_box": false,
            "sun_box": false
        });
        api.setState('errors', []);
        api.setState('isRepeatOnValid', true);
        api.setState('isRepeatCountValid', true);
    };

    //sets start and end date time based on user format and schedule timezone
    const setDateRange = (startDateTime, endDateTime, scheduleTimeZone) => {
        const DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
        const userTimeZone = api.context.session.user.timeZone;

        if (scheduleTimeZone) {
            startDateTime = convertTimezone(startDateTime, userTimeZone, scheduleTimeZone);
            endDateTime = convertTimezone(endDateTime, userTimeZone, scheduleTimeZone);
        }
        const userDateTimeFormat = api.context.session.user.dateTimeFormat.replaceAll('d', 'D').replaceAll('y', 'Y');
        const formattedStartTime = NowDateTime(startDateTime, DEFAULT_DATETIME_FORMAT).format(userDateTimeFormat);
        const formattedEndTime = NowDateTime(endDateTime, DEFAULT_DATETIME_FORMAT).format(userDateTimeFormat);
        api.setState('formattedStartDateTime', formattedStartTime);
        api.setState('formattedEndDateTime', formattedEndTime);
    };

    //convert date to utc only when schedule timezone != floating
    const setInputDateRange = (payload) => {
        const DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
        let start = payload.start;
        let end = payload.end;
        if (timeZone) {
            start = NowDateTime.tz(start, DEFAULT_DATETIME_FORMAT, payload.timeZone).utc().format(DEFAULT_DATETIME_FORMAT);
            end = NowDateTime.tz(end, DEFAULT_DATETIME_FORMAT, payload.timeZone).utc().format(DEFAULT_DATETIME_FORMAT);
        }

        api.setState('inputStartDateTime', start);
        api.setState('inputEndDateTime', end);
        api.setState('isConvertToScheduleDateTime', true);
    };

    initializeFormParameters();
    const timeZone = api.context.props.timeZone;
    api.setState('timeZone', timeZone);

    // initialize translation constants for repeat summary
    const translationConstants = await getTranslationConstants(helpers);
    api.setState('translationConstants', translationConstants);

    // get translated value for "Repeat until" field
    api.setState('repeatUntilLabel', await helpers.translate('Repeat until'));

    if (api.context.props.scheduleSpanSysId != "-1") {
        api.emit('SCHEDULE#HANDLE_DATA_FROM_RECORD');
    } else {
        const startDate = api.context.props.dateRange.startDate;
        const endDate = api.context.props.dateRange.endDate;

        api.setState('startDateTime', startDate);
        api.setState('endDateTime', endDate);
        setDateRange(startDate, endDate, timeZone);
        setInputDateRange({
            start: startDate,
            end: endDate,
            timeZone: api.context.session.user.timeZone
        });
    }
}
