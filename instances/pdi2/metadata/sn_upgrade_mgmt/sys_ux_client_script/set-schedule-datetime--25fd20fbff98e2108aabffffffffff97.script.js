/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {

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
        const parts = formatter.formatToParts(date); // FIXED: 'now' was used here mistakenly

        const map = {};
        for (const part of parts) {
            if (part.type !== 'literal') {
                map[part.type] = part.value;
            }
        }

        return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} ${map.dayPeriod}`;
    }

    const timezone = api.data?.get_timezone_name_1?.output?.timezone || 'US/Pacific';

    const nowPlusOneHr = new Date(Date.now() + 3600000);

    const scheduleDateTimeOneHrLater = formatDateInTimezone(nowPlusOneHr, timezone);
    api.setState('scheduleDateTime', scheduleDateTimeOneHrLater);
}
