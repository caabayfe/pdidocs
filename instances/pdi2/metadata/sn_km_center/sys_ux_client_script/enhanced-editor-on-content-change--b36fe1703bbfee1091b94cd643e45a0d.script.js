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

    const contentArray = event.payload.content || [];
    const temporarySysId = event.payload.temporarySysId || null;
    if (temporarySysId) {
        api.setState('temporarySysId', temporarySysId)
    }

    // Exit if there's no content to process
    if(!contentArray.length){
        return;
    }
    
    // Check if this is a KB knowledge article with a single content item
    if (api.data.record.table === 'kb_knowledge' && contentArray.length === 1) {

        // Special handling for KB articles - use 'text' as the field name
        const content = contentArray[0] ? contentArray[0].value : '';

        // Set the 'text' field value directly
        api.data.record.setFieldValue({
            fieldName: 'text',
            value: content
        });

        return; // Exit after handling the special case
    }

    // For KB Templates - set Field Values for each template field
    contentArray.forEach(item => {
        api.data.record.setFieldValue({
            fieldName: item.id,
            value: item.value
        });
    });

}
