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
    var currSamplePhrases = api.state.samplePhrases;
    for (let i = 0; i < currSamplePhrases.length; i++) {
        if (currSamplePhrases[i].sysId === event.context.item.value.sysId ) {
            currSamplePhrases[i].isEdit = !event.context.item.value.isEdit;
            currSamplePhrases[i].textInput = event.context.item.value.sampleText;
        }
    }
    api.setState('samplePhrases',[]);
    api.setState('samplePhrases',currSamplePhrases);

}
