/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {

    if (!api.state.selectedRecords)
        return;
    let errorMsgPrefix = await helpers.translate("Failed to associate the selected records. "),
        errorMsg = await helpers.translate("Try associating the record[s] again.");
    try {
        let overlapNum = 0;
        let associatedRecords = api.state.associatedRecords;
        let selectedRecords = api.state.selectedRecords;
        let successMsg = await helpers.translate("The interaction has been successfully associated with "),
            linkLabel = await helpers.translate("record"),
            textLink;
        api.state.selectedRecords.map((record) => {
            if (associatedRecords.indexOf(record) >= 0) {
                overlapNum += 1;
                return;
            }
            const templateFields = `document_table=${api.state.listTable}^document_id=${record}^interaction=${api.context.props.interactionSysId}`;
            if (!textLink)
                textLink = `/nav_to.do?uri=${api.state.listTable}.do?sys_id=${record}`;
            api.data.create_record.execute({
                "table": "interaction_related_record",
                "templateFields": templateFields,
                "useSetDisplayValue": ""
            });

        });
        let newAssociatedRecordsNum = selectedRecords.length - overlapNum;
        

        if (api.state.selectedRecords.length > 1) {
            textLink = `now/sow/record/interaction/${api.context.props.interactionSysId}/params/extra-params/subTabIndex%2F3/selected-tab-index/1`;

            if (overlapNum > 0) {
                successMsg = await helpers.translate('The interaction has been successfully associated to {0} of {1} selected records. Some records were already associated and have not been modified.', [newAssociatedRecordsNum, selectedRecords.length]);
                linkLabel = await helpers.translate(" Link.");
            } else {
                successMsg = await helpers.translate('The interaction has been successfully associated to {0} ', api.state.selectedRecords.length);
                linkLabel = await helpers.translate("records");
            }
        }
        api.emit('ASSOCIATE_RECORD#SHOW_NOTIFICATIONS', {
            items: [{
                id: "associate-record",
                status: "positive",
                icon: "info-circle-outline",
                content: successMsg,
                textLinkProps: {
                    label: linkLabel,
                    href: textLink,
                    opensWindow: false
                },
                action: {
                    type: 'dismiss'
                },

            }]
        });
    } catch (error) {
        api.emit('ASSOCIATE_RECORD#SHOW_NOTIFICATIONS', {
            items: [{
                id: "associate-record",
                status: "critical",
                icon: "info-circle-outline",
                content: {
                    type: "html",
                    value: "<span><b>" + errorMsgPrefix + "</b>" + errorMsg + "</span>",
                },
                action: {
                    type: 'dismiss'
                },

            }]
        });
    }
}
