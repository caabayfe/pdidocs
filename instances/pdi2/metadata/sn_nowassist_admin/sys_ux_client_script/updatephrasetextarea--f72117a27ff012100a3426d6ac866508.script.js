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
    let samplePhrases = api.state.samplePhrases;

    api.setState('selectedPhrase', selectedPhrase);
        event.context.item.value.textInput = event.payload.fieldValue;
        for (var i = 0; i < samplePhrases.length; i++) {
            if (samplePhrases[i].sysId === selectedPhrase) {
                samplePhrases[i].disableSave = event.payload.fieldValue.length > 200;
                break;
            }
        }
        api.setState("samplePhrases", []);
        api.setState("samplePhrases", samplePhrases);
  

}
