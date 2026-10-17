/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var filterCondition = '';
    var tableName = api.state.tableName;

    //Matching active intents
    if (event.payload.item.id === "Matching active intents") {
        filterCondition = 'intent_match=true^reason!=Intent topic map record is inactive^ORreasonISEMPTY';
        tableName = "Active";
    }
    //Matching inactive intents
    else if (event.payload.item.id === "Matching inactive intents") {
        filterCondition = 'intent_match=true^reason=Intent topic map record is inactive';
        tableName = "Inactive";
    }
    //Non-matching intents
    else if (event.payload.item.id === "Other") {
        filterCondition = 'intent_match=false';
        tableName = "Other";
    }
    //No intents found
    else if (event.payload.item.id === "No intents found") {
        filterCondition = 'intent_match=false^nlu_intent=NO_INTENT';
        tableName = "No intents found";
    }
    //Unsupported intents
    else if (event.payload.item.id === "Unsupported intents") {
        filterCondition = 'intent_match=false^nlu_intent!=NO_INTENT';
        tableName = "Unmapped intents";
    }
    //Specific matching intent
    else {
        filterCondition = 'nlu_intent=' + event.payload.item.id;
        tableName = event.payload.item.id;
    }

    helpers.translate(tableName).then((translatedText) => {
        api.setState('tableName', translatedText);
    });
    api.setState('filterCondition', filterCondition);
}
