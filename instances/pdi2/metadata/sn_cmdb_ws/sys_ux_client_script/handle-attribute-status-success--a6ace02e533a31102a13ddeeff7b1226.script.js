/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    try {
        const {
            getSelectionCount,
            transformColumnsForDisplay,
            transformRowsForDisplay
        } = imports['sn_cmdb_ws.DataCertificationListUtil'](...arguments);
        let {
            certificationFields
        } = api.data.getCertTaskData.output;
        const {
            output: attrStatusAndComment
        } = api.data.getCertAttrStatus;

        const {
            columnDefinitions,
            rowDefinitions,
            paginationProps: {
                totalRecordCount
            },
            selectionProps,
        } = api.data.listCtrl;
        let selectionCount = getSelectionCount(selectionProps, totalRecordCount);
        certificationFields = certificationFields.split(',');
        let updatedColumnDefinitions = await transformColumnsForDisplay(columnDefinitions, certificationFields);
        let updatedRowDefinitions = await transformRowsForDisplay(rowDefinitions, columnDefinitions, certificationFields, attrStatusAndComment, selectionProps, selectionCount, totalRecordCount);
        api.setState('columnDefinitions', updatedColumnDefinitions);
        api.setState('rowDefinitions', updatedRowDefinitions);
        api.setState('showListOverlay', false);
        api.setState('attrStatusAndCommentCache', ({currentValue}) => {
            return {...api.state.attrStatusAndCommentCache, ...attrStatusAndComment};
        });
    } catch (error) {
        api.setState('showListOverlay', false);
    }
}
