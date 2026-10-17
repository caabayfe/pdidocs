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
    let selectedPhrase = event.context?.item?.value?.sysId;
    let currentPhrase = event.context?.item?.value?.textInput;
    var payload = {};
    var data = {};

    let samplePhrases = api.state.samplePhrases;
    let deletedPhrases = api.state.deletedPhrases;

    api.setState('selectedPhrase', selectedPhrase);
    if (event.elementId === "button_save_edit" && currentPhrase != "") {
        for (var i = 0; i < samplePhrases.length; i++) {
            if (samplePhrases[i].sysId === selectedPhrase) {
                samplePhrases[i].sampleText = currentPhrase;
                samplePhrases[i].textInput = currentPhrase;
                samplePhrases[i].isEdit = false;
                samplePhrases[i].isEdited = true;
                break;
            }
        }
        api.setState("samplePhrases", samplePhrases);
        api.setState('selectedPhrase', '');
        data = {
            samplePhrases: samplePhrases,
            deletedPhrases: deletedPhrases
        };
        payload = {
            name: 'samplePhrases',
            validation: 'success',
            data: data,
            skipServerCall: false
        };
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'ACE_GUIDEDX_ITEM_UPDATED',
            eventPayload: payload
        });
    } else if (event.elementId === "button_cancel_edit" || event.elementId === "button_save_edit") {
        for (var i = 0; i < samplePhrases.length; i++) {
            if (samplePhrases[i].sysId === selectedPhrase) {
                event.context.item.value.textInput = samplePhrases[i].sampleText;
                samplePhrases[i].isEdit = false;
                break;
            }
        }
        api.setState("samplePhrases", []);
        api.setState("samplePhrases", samplePhrases);

        api.setState('selectedPhrase', '');
    } else if (event.elementId === "button_delete") {
        var phraseObject = {
            sysId: selectedPhrase
        };
        deletedPhrases.push(phraseObject);
        for (var i = 0; i < samplePhrases.length; i++) {
            if (samplePhrases[i].sysId === selectedPhrase) {
                samplePhrases.splice(i, 1);
                break;
            }
        }
        api.setState("samplePhrases", samplePhrases);
        api.setState("deletedPhrases", deletedPhrases);
        api.setState('selectedPhrase', '');
        data = {
            samplePhrases: samplePhrases,
            deletedPhrases: deletedPhrases
        };
        payload = {
            name: 'samplePhrases',
            validation: 'success',
            data: data,
            skipServerCall: false
        };
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'ACE_GUIDEDX_ITEM_UPDATED',
            eventPayload: payload
        });
    }

}
