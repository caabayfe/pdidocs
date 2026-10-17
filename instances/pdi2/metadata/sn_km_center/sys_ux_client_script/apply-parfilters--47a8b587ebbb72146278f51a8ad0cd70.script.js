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
    const MERGE_PAR_FILTERS_IMPORT = 'global.mergePARFilters';
    const STATE_PAR_FILTERS_KEY = 'parFilters';
    const STATE_ENCODED_QUERIES_KEY = 'encodedQueries';

    const mergePARFiltersV2 = imports[MERGE_PAR_FILTERS_IMPORT]().v2;
    const {
        appliedFilters
    } = event.payload;
    api.setState(STATE_PAR_FILTERS_KEY, ({
        currentValue,
        api
    }) => {
        const {
            parFilters,
            encodedQueries
        } = mergePARFiltersV2(
            currentValue,
            appliedFilters
        );
        api.setState(STATE_ENCODED_QUERIES_KEY, encodedQueries);

        const kbSysId = api.state.knowledgeBase;
        if (kbSysId == 'All') {
            api.setState('articleListEncodedQuery', 'articleISNOTEMPTY^article.latest=true^article.workflow_stateNOT INretired,outdated^article.valid_toISEMPTY^ORarticle.valid_to>=javascript:gs.beginningOfToday()');
        } else {
            api.setState('articleListEncodedQuery', 'knowledge_base=' + kbSysId + '^articleISNOTEMPTY^article.latest=true^article.workflow_stateNOT INretired,outdated^article.valid_toISEMPTY^ORarticle.valid_to>=javascript:gs.beginningOfToday()');
        }
        return parFilters;
    });
}
