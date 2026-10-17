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
    let selectedRecords = event.payload.data.output.selectedRecords;
    let associatedRecordDisplayValue = event.payload.data.output.associatedRecordDisplayValue;
    let associatedRecords = event.payload.data.output.associatedRecords;

    let successMsg, linkLabel,
        textLink = `now/sow/record/interaction/${api.context.props.interactionId}/params/selected-tab-index/1`;

    if (associatedRecords === 0) {
        let infoMsg = await helpers.translate("This interaction is already associated with the selected record(s).");
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [
                {
                    id: "op_message",
                    icon:"info-circle-outline",
                    content: infoMsg,
                    action: {
                        type: "dismiss"
                    }
                }
            ]
        });
        return;
    }

    if (associatedRecords === 1) {
        successMsg = await helpers.translate("The interaction has been successfully associated with ");
        linkLabel = associatedRecordDisplayValue;
    }
    

    if (selectedRecords > 1) {
        if (associatedRecords < selectedRecords) {
            successMsg = await helpers.translate("The interaction has been successfully associated to {0} of {1} selected records. Some records were already associated and have not been modified.", associatedRecords, selectedRecords);
            linkLabel = await helpers.translate(" Link.");
        }
        else {
            successMsg = await helpers.translate("The interaction has been successfully associated to {0} ", selectedRecords);
            linkLabel = await helpers.translate("records");
        }
    }
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [
            {
                id: "op_message",
                status: "positive",
                icon:"info-circle-outline",
                content: successMsg,
                textLinkProps: {
                    label: linkLabel,
                    href: textLink,
                    opensWindow: false
                },
                action: {
                    type: "dismiss"
                }
            }
        ]
    });
}
