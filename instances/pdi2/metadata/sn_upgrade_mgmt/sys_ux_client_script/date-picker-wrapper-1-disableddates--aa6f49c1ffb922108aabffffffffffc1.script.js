/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {




    function formatDateInTimezone(date, timeZone) {
        const options = {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);

        const map = {};
        for (const part of parts) {
            if (part.type !== 'literal') {
                map[part.type] = part.value;
            }
        }
        return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} ${map.dayPeriod}`;
    }

    var timezone = api.data?.get_timezone_name_1?.output?.timezone;
    const formattedScheduleDateTime = formatDateInTimezone(new Date(), timezone || 'US/Pacific');

    return [{
        before: formattedScheduleDateTime
    }];
}
