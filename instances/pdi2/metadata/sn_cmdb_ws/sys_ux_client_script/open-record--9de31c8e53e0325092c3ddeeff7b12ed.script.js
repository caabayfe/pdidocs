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
        table,
        searchType,
        encodedQuery,
        searchField,
        max,
        referenceKey
    } = api.context.props;
    const {
        fieldValue
    } = event.payload;

    if (!table)
        return;

    if (!referenceKey) {
        helpers.navigate.to('record', {
            table: table,
            sysId: fieldValue
        }, {}, false, false, 'current');
    } else {
        var url = `api/now/table/${table}?sysparm_query=${referenceKey}=${fieldValue}&sysparm_limit=1`;
        helpers.snHttp(url, {
                method: 'GET'
            })
            .then(({
                response
            }) => {
                var sysId = response?.result[0]?.sys_id;
                helpers.navigate.to('record', {
                    table: table,
                    sysId: sysId
                }, {}, false, false, 'current');
            });
    };
}
