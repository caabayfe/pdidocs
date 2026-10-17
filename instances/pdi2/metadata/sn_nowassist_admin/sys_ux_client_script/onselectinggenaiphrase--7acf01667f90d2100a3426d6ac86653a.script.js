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

    let deletedPhrases = api.state.deletedPhrases;
    let generatedPhrase = api.state.generatedPhrase;
    let samplePhrases = api.state.samplePhrases;


    switch (event.elementId) {
        case "checkbox_2":
            generatedPhrase.forEach(item => {
                if (item.phrase === event.context.item.value.phrase) {
                    item.isSelected = event.payload.value;
                }
            });
            //Check if all are selected
            var allSelected = generatedPhrase?.length > 0 ? generatedPhrase.every(item => item.isSelected) : false;
            api.setState("allSelected", allSelected);
            api.setState("generatedPhrase", generatedPhrase);
            break;
        case "button_4":
            generatedPhrase.forEach(item => {
                if (item.phrase === event.context.item.value.phrase) {
                    item.isSelected = true;
                    item.isAdded = true;
                    var phraseObject = {
                        sampleText: item.phrase,
                        isNew: true,
                        isEdit: false,
                        sysId: item.sysId,
                        isGenerated: true
                    };
                    samplePhrases.unshift(phraseObject);
                }
            });
            api.setState("samplePhrases", samplePhrases);
            api.setState("generatedPhrase", generatedPhrase);
            break;
        case "checkbox_1":
            generatedPhrase.forEach(item => {
                if (!item.isAdded) {
                    item.isSelected = event.payload.value;
                }
            });
            api.setState("allSelected", event.payload.value);
            api.setState("generatedPhrase", generatedPhrase);
            break;
        case "button_5":
            generatedPhrase.forEach(item => {
                if (item.isSelected && item.isAdded === false) {
                    item.isSelected = true;
                    item.isAdded = true;
                    var phraseObject = {
                        sampleText: item.phrase,
                        isNew: true,
                        isEdit: false,
                        isGenerated: true
                    };
                    samplePhrases.unshift(phraseObject);
                }
            });
            api.setState("samplePhrases", samplePhrases);
            api.setState("generatedPhrase", generatedPhrase);
            break;
    }

    let data = {
        samplePhrases: samplePhrases,
        deletedPhrases: deletedPhrases
    };
    let payload = {
        name: 'samplePhrases',
        validation: 'success',
        data: data,
        skipServerCall: false
    };
    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'ACE_GUIDEDX_ITEM_UPDATED',
        eventPayload: payload
    });
    api.setState("createPhraseDisabled", true);


}
