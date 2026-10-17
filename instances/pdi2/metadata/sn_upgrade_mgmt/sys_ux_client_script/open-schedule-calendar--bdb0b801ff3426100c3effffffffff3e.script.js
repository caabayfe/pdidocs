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
        const pad = (n) => n.toString().padStart(2, '0');

        const yyyy = date.getFullYear();
        const MM = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());

        let hours = date.getHours();
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // 0 becomes 12
        const hh = pad(hours);

        return `${yyyy}/${MM}/${dd} ${hh}:${minutes}:${seconds} ${ampm}`;
    }
    const date = api.data.look_up_multiple_records_2.results[0].next_action.displayValue;
    api.setState('calendarDateString', formatDate(new Date(date)));

    helpers.modal.open('custom_1');
}
