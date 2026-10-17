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

        function parseInTimeZone(dateStr, timeZone) {
            // Step 1: Parse the string manually (format is known)
            const [datePart, timePart, ampm] = dateStr.split(/[\s]+/);
            const [year, month, day] = datePart.split("-").map(Number);
            let [hour, minute, second] = timePart.split(":").map(Number);

            if (ampm === "PM" && hour < 12) hour += 12;
            if (ampm === "AM" && hour === 12) hour = 0;

            // Step 2: Build a Date object in UTC using Intl API trick
            // Use the time zone offset at that time in the target zone
            const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

            // Step 3: Get timezone offset at that instant
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone,
                hour12: false,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });

            // Get formatted parts in the target time zone
            const parts = formatter.formatToParts(utcDate).reduce((acc, part) => {
                if (part.type !== "literal") acc[part.type] = part.value;
                return acc;
            }, {});

            // Create timestamp of target time zone as if it were UTC
            const localTime = Date.UTC(
                +parts.year,
                +parts.month - 1,
                +parts.day,
                +parts.hour,
                +parts.minute,
                +parts.second
            );

            // Offset difference between UTC and timeZone time
            const offsetMs = localTime - utcDate.getTime();

            // Adjust the input time to be in correct zone
            const adjustedDate = new Date(utcDate.getTime() - offsetMs);
            return adjustedDate;
        }
  
    function isSelectedDateInFuture(payloadDateObj,timeZone) {

        const nowPlusOneHr = new Date();
        nowPlusOneHr.setTime(nowPlusOneHr.getTime() + 3600000);

        const isInFuture = (payloadDateObj.getTime() >= nowPlusOneHr.getTime());

        return isInFuture;
    }

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

    var instanceTimeZone = api.data?.get_timezone_name_1?.output?.timezone;

    var selectedDateStr = event.payload.value;
    if (event.payload?.error?.type?.toLowerCase() === "error") {
         api.setState('scheduleDateTime', null);
         return;
    }

    const dateStr = api.state.scheduleDateTime;
    if (!dateStr) {
        api.setState('scheduleDateTime', null);
        return;
    }
    if (isNaN(new Date(dateStr).getTime())) {
        api.setState('scheduleDateTime', null);
        return;
    }

    var selectedDateInInstanceTimeZone = parseInTimeZone(selectedDateStr,instanceTimeZone);

    if (isSelectedDateInFuture(selectedDateInInstanceTimeZone,instanceTimeZone)) {

        api.setState('scheduleDateTime', selectedDateStr);
        api.setState("hideCalendarMessage", true);
    } else {
        const nowPlusOneHr = new Date();
        nowPlusOneHr.setTime(nowPlusOneHr.getTime() + 3600000);

        const formattedScheduleDateTime = formatDateInTimezone(nowPlusOneHr, instanceTimeZone || 'US/Pacific');

        api.setState('scheduleDateTime', formattedScheduleDateTime);
        api.setState("hideCalendarMessage", false);
        helpers.timing.setTimeout(() => api.setState("hideCalendarMessage", true), 2000);
    }

}
