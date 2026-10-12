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
        props: {
            currentValue,
            displayValue,
            displayValueList
        }
    } = api.context;
    const ids = currentValue.length == 0 ? [] : currentValue.split(",");
    const length = ids.length;
    if (length != 0) {
        const labels = displayValueList ? displayValueList : displayValue.split(",");

        let selectedItems = ids.map((id, index)=>{
            return [{
                id,
                label : labels[index]
            }];
        });
        api.setState("selectedItems", selectedItems);
    }
}
