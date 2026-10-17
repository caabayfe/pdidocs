/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.data.changes.includes('percent_complete')) {
        api.setState('progressValue', event.payload.data.record.percent_complete.value);
    }
    if (event.payload.data.changes.includes('result')) {
        helpers.timing.setTimeout(() => {
            var parsedResult = JSON.parse(event.payload.data.record.result.value);
            api.setState('progressId', '');
            api.setState('progressValue', 0);
            api.emit('CERT_CTRL#ATTR_UPDATE_SUCCEEDED', {
                ...parsedResult 
            });
            const { selectionProps } = api.data.listCtrl;
            const {
                certifiedRecords,
                updatedAttrStatus
            } = parsedResult;

            // Calculate which rows should be selected again
            let sysIds = Object.keys(updatedAttrStatus);
            sysIds = sysIds.filter((item) => !certifiedRecords.includes(item));
            api.setState('previousSelection', {
                ...selectionProps,
                selectedRowIds: sysIds
            });
            api.setState('attrStatusAndCommentCache', ({currentValue}) => {
                return {...currentValue, ...parsedResult.updatedAttrStatus};
            });
        }, 1000);
    }
}
