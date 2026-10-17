/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    api.setState('finalSelectedCategory',api.state.selectedCategory);
    api.data.assets__create_catalog_item_1.execute({
        "mSysId": api.context.props.sysId,
        "catSysId": api.state.selectedCategory,
        "table": api.context.props.table
    });
}
