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
    const commMgmtUXFBaseUtil = imports["sn_uib_tcm.CommunicationManagementUXFClientBaseUtil"]();
    const recipients = api.data.search_recipients.output;
    if (!recipients) return;
    const { inputSearchQuery, searchQueryTypeAhead, searchQueryTypeAheadMulti } = api.state;
    const searchResults = [];
    for (let type in recipients) {
        searchResults.push(commMgmtUXFBaseUtil.processRecipientsForDropdown(type, recipients[type]));
    }
    if (inputSearchQuery === searchQueryTypeAhead) {
        api.setState("searchResultsTypeAhead", searchResults);
    } else if (inputSearchQuery === searchQueryTypeAheadMulti) {
        api.setState("searchResultsTypeAheadMulti", searchResults);
    }
}
