/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Apply query filters when chart item is clicked
    const {
        isSelected,
        data
    } = event.payload;

    // We have two groupBy fields: [group_description, group_id]. 
    // We want to use group_id for selection.
    const title = data.elements[0];
    const groupId = data.elements[1];

    // Check if list filters are empty
    const areFiltersEmpty = !api.state.listFilters;

    // Remove existing group_description filter
    let query = areFiltersEmpty ? '' : api.state.listFilters.split("^")
        .filter(param => !param.startsWith("group_id"))
        .join("^");

    if (isSelected) {
        query += query === '' ? `group_id=${groupId}` : `^group_id=${groupId}`;
        api.setState("listTitle", title);
    } else {
        const defaultTitle = await helpers.translate("Knowledge Gap Candidates");
        api.setState("listTitle", defaultTitle);
    }

    api.setState("listFilters", query);
    api.setState("selectedGroup", isSelected ? groupId : '');
}
