/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { items, success, rowCount } = event.payload.data.output.data.snPo.GlideProminFindings.getReferenceItems;

    if (!success) {
        return;
    }

    const sectionLabelWithItems = await helpers.translate('Showing 1-{itemCount} of {rowCount}', {
        itemCount: items.length,
        rowCount
    });
    const sectionLabelWithNoItems = await helpers.translate('No results found');

    const sectionLabel = items.length > 0
        ? sectionLabelWithItems
        : sectionLabelWithNoItems

    api.setState('watchListItems', [{
        id: 'watchlist-dropdown',
        label: sectionLabel,
        children: items,
    }]);
}
