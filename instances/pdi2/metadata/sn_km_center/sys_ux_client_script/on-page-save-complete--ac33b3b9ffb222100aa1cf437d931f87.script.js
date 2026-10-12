/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {payload} = event;
    const {status} = payload;
    const sysId = api.context.props.sysId;
    const extraParams = api.state.extraParams;
    
    // If save failed - bail out
    // OR if sysId is -1 on on the page, this is a first time save and we
    // will handle the timestamp update in the On Page Changed UI Script.
        // If save failed, bail out
    if (status !== 'success') {
        return;
    }

    // If sysId is -1, this is a first-time save; handle timestamp update and bail out
    if (sysId === "-1") {
        api.setState("gapsSysIds", extraParams.gapsSysIds);
        return;
    }

    // This triggers the ECE component save the internal assets.
    api.setState('lastSavedTimestamp', Date.now());

    // This ensure the enhanced_article flag is set, regardless of which view is present
    api.data.set_editor_type_1.execute({        	
		  table: api.context.props.table,
		  recordId: api.context.props.sysId,
		  templateFields: 'editor_type=ECE',
		  useSetDisplayValue: null
    });
}
