/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        setNavItems,
        setNavChildItems,
        setAttributes,
        setResources,
        NAVIGATION_ITEM_KEY
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    setNavItems(api.data.explore_ci_get_nav_tree.output);
    const { attributeSections, resources } = api.context.props;
    if (resources && resources.length > 0) {
        setResources(resources);
    }
    if (attributeSections && attributeSections.length > 0) {
        setAttributes(attributeSections);
    }
}
