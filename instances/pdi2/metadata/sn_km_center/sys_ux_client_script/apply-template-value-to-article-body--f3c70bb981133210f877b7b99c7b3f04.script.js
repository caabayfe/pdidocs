/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var fieldName = event.payload && event.payload.fieldName;
    var value = event.payload && event.payload.value;

    var articleFields = api.state.articleFields || [];
    var isArticleField = articleFields.some(function(field) {
        return field.id === fieldName;
    });

    if ((fieldName === 'text' || isArticleField) && value) {
        var existingFields = api.state.eceHTMLFields || [];

        // Create new array with new objects (deep copy) to trigger state change detection
        var htmlFields = existingFields.map(function(field) {
            if (field.id === fieldName) {
                // Return new object with updated value
                return {
                    ...field,
                    value: value
                };
            }
            // Return new object with existing values
            return field;
        });

        api.setState('eceHTMLFields', htmlFields);
    }
}
