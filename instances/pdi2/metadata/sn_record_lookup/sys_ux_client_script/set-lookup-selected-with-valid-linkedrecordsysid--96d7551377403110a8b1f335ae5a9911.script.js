/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const linkedRecordSysId = api.context.props.linkedRecordSysId;

    if (linkedRecordSysId && linkedRecordSysId !== '-1') {
        api.setState('lookupState', 'selected');
        api.setState('selectedRecord', linkedRecordSysId);
    } 

    // Switch to 'search' state when linkedRecordSysId is 'null' or empty string
    if (linkedRecordSysId === null || linkedRecordSysId === '') {
        api.setState('lookupState', 'search');
    }

    // Stay on 'loading' state when linkedRecordSysId is undefined.
    // This is for data binding case which may pass 'undefined' if data resource is not finish rendering.
    // E.x. @data.record.sysId may render 'undefined' first then real sysId. 
    // In this case, lookup should stay on loading state until real sysId is passed in. 
}
