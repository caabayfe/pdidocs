/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('attributeData' , ({ currentValue, api }) => {
        let attributeData = JSON.parse(JSON.stringify(currentValue));
        // Avaialble are all classses minus any that are currently selected.
        attributeData.available = currentValue.all.filter((o) => (!api.state.attributesToCompare.find(item => (item === o.id))));

        return attributeData;
    });
}
