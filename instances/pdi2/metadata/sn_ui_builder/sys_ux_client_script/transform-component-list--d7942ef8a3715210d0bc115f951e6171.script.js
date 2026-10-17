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
    const viewportLabel = await helpers.translate('Viewport');
    const frequentlyUsedLabel = await helpers.translate('Frequently used');
    const allItemsLabel = await helpers.translate('All components');
    const TOP_MACROPONENTS = ["b324da974cef96f2db1d484cfeda4e3e", "61c315e9ccb8970546c30f3e2da41a32"];
    const fakeViewportItem = {
        "id": "VIEWPORT",
        "macroponentSysId": "VIEWPORT",
        "label": viewportLabel
    };

    const frequentlyUsedSection = {
        id: 'freqs',
        label: frequentlyUsedLabel,
        children: []
    };

    const allItemsSection = {
        'id': 'allitems',
        label: allItemsLabel,
        children: []
    };

    const results = api.data.look_up_multiple_records_1.results;
    const updatedResult = results.map(elem => ({
        id: elem._row_data.uniqueValue || '',
        macroponentSysId: elem.macroponent.value || '',
        label: elem.label.value || ''
    }));
    updatedResult.sort((a, b) => {
        return a.label.localeCompare(b.label);
    });
    // Move components with these macroponent sysids to freqs
    TOP_MACROPONENTS.forEach((topMacroponentSysId)=>{
        updatedResult.some((elem, index) =>
            elem.macroponentSysId === topMacroponentSysId &&
            frequentlyUsedSection.children.push(
                updatedResult.splice(index, 1)[0]
            )
        );
    });
    frequentlyUsedSection.children.unshift(fakeViewportItem);
    allItemsSection.children = updatedResult;
    api.setState('componentsList', [frequentlyUsedSection,allItemsSection]);
}
