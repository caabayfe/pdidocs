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
    function formatDate(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;

    }
    const upgradeStartDate = api.state.upgradeStart;
    const modifiedDate = new Date(event.payload.value);
    const now = new Date();
    const pstTime = new Date(now.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles"
    }));
    const fourDaysBefore = new Date(upgradeStartDate);
    fourDaysBefore.setDate(fourDaysBefore.getDate() - 4);

    const lastSaturday = new Date(fourDaysBefore);
    const day = lastSaturday.getDay();
    if (day !== 6) {
        const daysToGoBack = (day + 1) % 7;
        lastSaturday.setDate(lastSaturday.getDate() - daysToGoBack);
    }

    lastSaturday.setHours(0, 0, 0, 0);

    if (modifiedDate < pstTime) {
        api.setState("schemaAlterDateValid", "past");
    } else if (modifiedDate < lastSaturday || modifiedDate > fourDaysBefore) {
        api.setState("schemaAlterDateValid", "invalid");
    } else {
        api.setState("schemaAlterDateValid", "valid");
    }
    const calendarModifiedDate = formatDate(modifiedDate);
    api.setState('calendarModifiedDate', formatDate(modifiedDate));
    api.setState('calendarDate', modifiedDate);
}
