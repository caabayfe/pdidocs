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
    if (event.name === "DATA_FETCH_SUCCEEDED") {
        var output = api.data.km_record_page_fetch_embedded_queries_1.output;
        if (output.success) {
            var content = output.content;
            if (content) {
                var query = api.context.props.query;
                for (var fieldName in content) {
                    var queryKey = '^' + fieldName + '=';
                    if (query && query.indexOf(queryKey) > -1)
                        continue;
                    api.emit("KB_VIEW#SET_FIELD", {
                        fieldName: fieldName,
                        value: content[fieldName]
                    });
                }
            }
        }
    }
}
