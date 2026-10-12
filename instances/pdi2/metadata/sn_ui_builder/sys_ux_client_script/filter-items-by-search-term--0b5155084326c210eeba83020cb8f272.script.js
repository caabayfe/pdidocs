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
    const searchTerm = (event.payload.searchTerm || '').toLowerCase();
    const allItems = api.context.props?.homepageProps ?? api.context.props.allItems;
    const filteredItems = !!searchTerm ? allItems.filter(({
        label
    }) => label.toLowerCase().includes(searchTerm)) : allItems;

    api.setState('filteredItems', filteredItems);
    api.setState('filteredItemsByClass', filteredItems?.reduce((acc, item) => {
        if (!acc[item.className]) {
            acc[item.className] = [];
        }
        acc[item.className].push(item);
        return acc;
    }, {}));
}
