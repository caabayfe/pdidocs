/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var domainFetched = api?.data?.get_user_domain_1;
    var sessionDomain = domainFetched?.output?.domain;

    var rowDefs = api?.data?.list_controller?.rowDefinitions;
    if (!rowDefs) return [];

    var rows = rowDefs?.rows || [];

    if (sessionDomain != 'global') {
        // Filter out 'Global' domain executions
        var records = rows.length;
        var removeIndex = [];
        for (var i = 0; i < records; ++i) {
            var record = rows[i];
            var domainValue = record?.cells?.hui_sys_domain?.metadata?.internalValue;
            if (domainValue !== sessionDomain) {
                removeIndex.push(i);
            }
        }
        if (removeIndex.length > 0) {
            rows = rows.filter((_, index) => !removeIndex.includes(index));
        }
    }
    rowDefs.rows = rows;
    return rowDefs;
}
