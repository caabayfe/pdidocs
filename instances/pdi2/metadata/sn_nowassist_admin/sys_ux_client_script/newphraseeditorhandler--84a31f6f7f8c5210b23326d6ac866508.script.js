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
    let newPhrase= api.state.newPhrase ? api.state.newPhrase: "";
    var payload ={};
    var data ={};

    let samplePhrases = api.state.samplePhrases;
    let deletedPhrases = api.state.deletedPhrases;
    if (event.elementId === "textarea_3" && event.name === "NOW_TEXTAREA#INPUT" ) {
        api.setState('newPhrase', event.payload.fieldValue);
    }

    if (event.elementId === "button_save" && event.name === "NOW_BUTTON#CLICKED" && newPhrase != "") {
        let newPhraseId = api.state.lastNewPhraseId + 1;
        samplePhrases.unshift({
            sampleText: api.state.newPhrase,
            sysId: newPhraseId.toString(),
            isEdit: false,
            isNew: true
        });
        api.setState("samplePhrases", samplePhrases);
        data = {
            samplePhrases: samplePhrases,
            deletedPhrases: deletedPhrases,
            filterId: api.state.filterId
        };

        api.setState("createPhraseDisabled", true);
        api.setState("newPhrase", "");
        api.setState("lastNewPhraseId",newPhraseId);
        payload = {
            name: 'samplePhrases',
            validation: 'success',
            action_type: 'update',
            data: data,
            skipServerCall: false
        };
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'ACE_GUIDEDX_ITEM_UPDATED',
            eventPayload: payload
        });

    }else if(event.name === "NOW_BUTTON#CLICKED") {
        api.setState("createPhraseDisabled", true);
        api.setState("newPhrase", "");
    }

}
