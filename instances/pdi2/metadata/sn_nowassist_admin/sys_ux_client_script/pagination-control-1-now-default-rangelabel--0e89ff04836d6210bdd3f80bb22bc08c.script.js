/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var startRange = 1;
    var lastRange = 10;

    if (api.state.totalRecord == 0) {
        return '';
    }
    if (lastRange > api.state.totalRecord) {
        lastRange = api.state.totalRecord;
    }
    if (api.state.currPageNumber && api.state.pageSize) {
        var startRange = (api.state.currPageNumber * api.state.pageSize);
        var lastRange = (api.state.currPageNumber * api.state.pageSize) + api.state.pageSize;
        lastRange = lastRange > api.state.totalRecord ? api.state.totalRecord : lastRange;
        startRange = (startRange>= lastRange ? 1 : startRange)
    }
    return helpers.translate('Showing {start}-{end} of {total}', {
        start: startRange,
        end: lastRange,
        total: api.state.totalRecord
    });
}
