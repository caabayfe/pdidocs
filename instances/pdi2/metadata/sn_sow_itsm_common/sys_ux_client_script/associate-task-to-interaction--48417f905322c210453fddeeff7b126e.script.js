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
    const association_table = 'interaction_related_record';
    let duplicateInfoMsg = await helpers.translate("This interaction is already associated with the selected record.");
    let successMessageContent = await helpers.translate('The interaction has been successfully associated with ');
    let errorMessageContent = await helpers.translate('Operation failed, Please check if the interaction is already associated with {0}', event.context.item.value.number);
    let associationUrl = `/api/now/table/${association_table}`;
    const body = {
        operation: "Created",
        document_table: event.context.item.value.table,
        document_id: event.context.item.value.sys_id,
        interaction: api.context.props.recordSysId
    };
    helpers.snHttp(associationUrl, {
        method: 'POST',
        body
    }).then(result => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'interaction-save',
                status: "positive",
                icon: "info-circle-outline",
                content: successMessageContent,
                textLinkProps: {
                    label: event.context.item.value.number,
                    href: "/nav_to.do?uri=task.do?sys_id=" + event.context.item.value.sys_id
                },
                action: {
                    type: "dismiss"
                }
            }]
        });
        api.emit('REFRESH_INTERACTION_RELATED_RECORDS', {
            listName: "interaction_related_record.interaction"
        });
    }).catch(result => {
        let errorDetail = result?.error?.data?.error?.detail;
        if (errorDetail.indexOf("Prevent duplicate record insertion") !== -1) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: 'interaction-save',
                    icon: "info-circle-outline",
                    content: duplicateInfoMsg,
                    action: {
                        type: "dismiss"
                    }
                }]
            });

        } else
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'interaction-save',
                    status: "critical",
                    icon: "info-circle-outline",
                    content: errorMessageContent,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
    });
}
