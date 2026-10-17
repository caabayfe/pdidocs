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
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            helpers.timing.clearTimeout(timeout);
            timeout = helpers.timing.setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
    var getReferenceTableItemsFn = debounce(function() {
        api.data.get_reference_table_items.execute({
            table: api.state.selectedActivityFieldDetails.referenceTable,
            searchTerm: event.payload.value
        });
    }, 300);
    getReferenceTableItemsFn();
}
