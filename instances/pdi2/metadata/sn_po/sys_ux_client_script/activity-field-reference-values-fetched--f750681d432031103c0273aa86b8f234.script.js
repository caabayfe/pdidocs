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
    // Import formatting of numbers
    const {
        formatNumber,
    } = imports["global.prominUtils"]();
    const {
        items,
        rowCount
    } = event.payload.data.output.data.snPo.GlideProminFindings.getReferenceItems;

    const sectionLabel = items.length > 0 ?
        await helpers.translate('Showing 1-{0} of {1}',
            items.length,
            formatNumber(rowCount),
        ) :
        await helpers.translate('No results found');
    const activityValues = [{
            id: 'reference-values-section',
            label: sectionLabel,
            children: items
        }];
    api.setState('fieldSelectValuesListItems', []);
    api.setState('activityValues', activityValues);
}
