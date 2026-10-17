function script({api, event, helpers, imports}) {
    const {
        getSelectionCount,
        transformColumnsForDisplay,
        transformRowsForDisplay
    } = imports['sn_cmdb_ws.DataCertificationListUtil'](...arguments);
    let { certificationFields } = api.data.getCertTaskData.output;
    const { 
        columnDefinitions,
        rowDefinitions,
        paginationProps: {
            totalRecordCount
        },
        selectionProps
    } = api.data.listCtrl;

    let { attrStatusAndCommentCache } = api.state;
    const selectionCount = getSelectionCount(selectionProps, totalRecordCount);
    helpers.snHttp('/api/sn_cmdb_ws/cmdb_workspace_api_scoped/certification/action', 
        {
            method: 'POST',
            batch: false,
            body: {
                ...event.payload
            }
        }
    ).then(async function({response}) {
        const {
             updatedAttrStatus,
             progressId,
             certifiedRecords
        } = response.result.result;

        if (progressId) {
            api.setState('progressId', progressId);
            return;
        }
        api.emit('CERT_CTRL#ATTR_UPDATE_SUCCEEDED', {
            ...response.result.result 
        });

        // Calculate which rows should be selected again
        let sysIds = Object.keys(updatedAttrStatus);
        sysIds = sysIds.filter((item) => !certifiedRecords?.includes(item));
        api.setState('previousSelection', {
            ...selectionProps,
            selectedRowIds: sysIds
        });
        attrStatusAndCommentCache = {
            ...attrStatusAndCommentCache,
            ...updatedAttrStatus
        };
        certificationFields = certificationFields.split(',');
        let updatedColumnDefinitions = await transformColumnsForDisplay(columnDefinitions, certificationFields);
        let updatedRowDefinitions = await transformRowsForDisplay(rowDefinitions, columnDefinitions, certificationFields, attrStatusAndCommentCache, selectionProps, selectionCount, totalRecordCount);
        api.setState('columnDefinitions', updatedColumnDefinitions);
        api.setState('rowDefinitions', updatedRowDefinitions);
        api.setState('showListOverlay', false);
        api.setState('attrStatusAndCommentCache', attrStatusAndCommentCache);
    }).catch((error) => {
        api.setState('showListOverlay', false);
    });
 }
