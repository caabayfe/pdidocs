
      
      
      /**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {


    const docTypeArray = ['.doc', '.docx'];
    const sameVersionError = "Source and target versions must be different. Select different versions.";
    const sameFormatError = "Source version and Target version must be in the same format.";
    const hideAllErrors = function (api) {
        api.setState('hideTargetError', true);
        api.setState('hideSourceError', true);
        api.setState('hideTypeMismatchError', true);
        api.setState('compareDisabled', true);
    };
    var sourceId = "";
    var targetId = "";
    var sourceFormat = "";
    var targetFormat = "";

    // if target version is selected
    if (event.elementId == "target_version") {
        api.setState('targetId', event.payload.item.id);
        api.setState('targetFormat', event.payload.item.value);
        targetId = event.payload.item.id;
        targetFormat = event.payload.item.value;
        sourceId = api.state.sourceId;
        sourceFormat = api.state.sourceFormat;

        //showing target format error
        if (targetFormat && targetFormat != '' && !docTypeArray.includes(targetFormat)) {
            hideAllErrors(api);
            api.setState('hideTargetError', false);
            return;
        }
        api.setState('hideTargetError', true);

        //showing source format error
        if (sourceFormat && sourceFormat != '' && !api.state.hideSourceError) {
            hideAllErrors(api);
            api.setState('hideSourceError', false);
            return;
        }
        api.setState('hideSourceError', true);
    }
    // if source version is selected
    else if (event.elementId == "source_version") {
        api.setState('sourceId', event.payload.item.id);
        api.setState('sourceFormat', event.payload.item.value);
        sourceId = event.payload.item.id;
        sourceFormat = event.payload.item.value;
        targetId = api.state.targetId;
        targetFormat = api.state.targetFormat;

        //showing source format error
        if (sourceFormat && sourceFormat != '' && !docTypeArray.includes(sourceFormat)) {
            hideAllErrors(api);
            api.setState('hideSourceError', false);
            return;
        }
        api.setState('hideSourceError', true);

        //showing target format error
        if (targetFormat && targetFormat != '' && !api.state.hideTargetError) {

            hideAllErrors(api);
            api.setState('hideTargetError', false);
            return;
        }
        api.setState('hideTargetError', true);
    }

    //hiding compare button when either of the select box is empty.
    if (!sourceId || sourceId == '' ||
        !targetId || targetId == '') {
        api.setState('compareDisabled', true);
        return;
    }

    //showing same version error.
    if (targetId == sourceId) {
        api.setState('hideTypeMismatchError', false);
        api.setState('compareDisabled', true);
        helpers.translate(sameVersionError)
            .then((translatedText) => {
                api.setState('genericError', sameVersionError);
            });
        return;
    }

    //showing type mismatch error.
    if (targetFormat !== sourceFormat) {
        api.setState('hideTypeMismatchError', false);
        api.setState('compareDisabled', true);
        helpers.translate(sameFormatError)
            .then((translatedText) => {
                api.setState('genericError', sameFormatError);
            });
        return;
    }
    api.setState('hideTypeMismatchError', true);
    api.setState('compareDisabled', false);


}
