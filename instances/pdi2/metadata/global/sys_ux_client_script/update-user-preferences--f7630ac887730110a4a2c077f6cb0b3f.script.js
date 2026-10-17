/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const blockName = api.context.props.payload.name;
    var selectedValue = event.payload.value;
    if (blockName === "Days Drop Down") {
        switch (selectedValue) {
            case "id1":
                selectedValue = 30;
                break;
            case "id2":
                selectedValue = 60;
                break;
            case "id3":
                selectedValue = 90;
                break;
        }
    }
    api.setState('payload', {
        name: blockName,
        value: selectedValue
    });
}
