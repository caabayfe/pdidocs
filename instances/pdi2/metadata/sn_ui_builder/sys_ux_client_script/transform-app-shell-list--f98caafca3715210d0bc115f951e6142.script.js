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
    const results = api.data.look_up_multiple_records_2.results;
    const updatedResult = results.map(elem => ({
        id: elem._row_data.uniqueValue || '',
        label: elem.name.value || ''
    }));

    updatedResult.sort((a, b) => {
        return a.label.localeCompare(b.label);
    });

    const defaultAppShell = updatedResult.find((elem) => {
        return elem.id === "76a83a645b122010b913030a1d81c780";
    });

    api.setState('appShellList', updatedResult);
    api.setState('selectedAppShell', defaultAppShell);
}
