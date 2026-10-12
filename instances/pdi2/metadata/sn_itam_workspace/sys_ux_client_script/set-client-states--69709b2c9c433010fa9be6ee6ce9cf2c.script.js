function handler({api, event, helpers, imports}) {
    var value = event.payload.value;
    if (event.elementId === 'quantity_input') {
        api.setState('quantity',value);
    }
    if (event.elementId === 'reason_text') {
        api.setState('reason',value);
    }
    if (event.elementId === 'checkbox_defective') {
        api.setState('defective',value);
    }
}
