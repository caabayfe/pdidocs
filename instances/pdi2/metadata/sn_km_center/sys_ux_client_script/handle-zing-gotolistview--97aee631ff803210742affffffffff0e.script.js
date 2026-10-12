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
        tableName,
        conditions,
        term
    } = event.payload;
    const props = api.context.props;
    const searchTerm = term || props.searchTerm;
    const query = `GOTO123TEXTQUERY321=${searchTerm}^${conditions}`;
    const fields = {
        table: tableName
    };
    const params = {
        query
    };
    const { handlePageNavigation } = imports["sn_km_center.searchInputUtils"]();
    handlePageNavigation(helpers, 'kc-list-view', fields, params);
}
