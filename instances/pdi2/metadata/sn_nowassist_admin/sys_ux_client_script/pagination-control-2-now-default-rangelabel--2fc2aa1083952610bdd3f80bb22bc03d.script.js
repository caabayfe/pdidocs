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

    if (api.state.filteredSkillListCount == 0) {
        return '';
    }
    if (lastRange > api.state.filteredSkillListCount) {
        lastRange = api.state.filteredSkillListCount;
    }
    if (api.state.currPageNumber && api.state.pageSize) {
        var startRange = (api.state.currPageNumber * api.state.pageSize);
        var lastRange = (api.state.currPageNumber * api.state.pageSize) + api.state.pageSize;
        lastRange = lastRange > api.state.filteredSkillListCount ? api.state.filteredSkillListCount : lastRange;
        startRange = (startRange>= lastRange ? 1 : startRange)
    }
    return helpers.translate('Showing {start}-{end} of {total}', {
        start: startRange,
        end: lastRange,
        total: api.state.filteredSkillListCount
    });


    }
