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
    if (event && event.payload && event.payload.data && event.payload.data.output && event.payload.data.output.result) {
        const {
            error,
            action,
            successCount,
            failureCount,
            deDupeTaskNumber,
            deDupeUrl
        } = event.payload.data.output.result;

        const {
            SUCCESS_NOTIFICATION_PROPS,
            ERROR_NOTIFICATION_PROPS,
            handleRemoveNotifications
        } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();

        const { hasCmdbEditor, hasAdminOrMaint } = imports["sn_cmdb_ws.userRoleUtils"]();
        const notifications = [];

        if (error && error.message) {
            notifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "content": await helpers.translate("Error - {0}", error.message)
            });
        }
        if (successCount > 0) {
            let messageContent = '';
            let txtLinkProp = {};
            if (action === 'attest') {
                messageContent = successCount > 1 ?
                    await helpers.translate("{0} CIs attested", successCount) :
                    await helpers.translate("{0} CI attested", successCount);
            } else if (action === 'reject') {
                messageContent = successCount > 1 ?
                    await helpers.translate("{0} CIs rejected", successCount) :
                    await helpers.translate("{0} CI rejected", successCount);
            } else if (action === 'unattest') {
                messageContent = successCount > 1 ?
                    await helpers.translate("{0} CIs unattested", successCount) :
                    await helpers.translate("{0} CI unattested", successCount);
            } else if (action === 'exclude') {
                messageContent = successCount > 1 ?
                    await helpers.translate("{0} CIs excluded", successCount) :
                    await helpers.translate("{0} CI excluded", successCount);
            } else if (action === 'duplicate') {
                var deDupeNumberDisplay = ""; 
                if (deDupeTaskNumber && deDupeUrl) {
                    if (hasCmdbEditor(api.context.session.user.roles) || hasAdminOrMaint(api.context.session.user.roles)) {
                        txtLinkProp = {
                            "label": deDupeTaskNumber,
                            "href": deDupeUrl
                        };
                    } else {
                        deDupeNumberDisplay = deDupeTaskNumber;
                    }
                }
                messageContent = successCount > 1 ?
                    await helpers.translate("{0} CIs removed from task. De-duplication task created {1}", successCount, deDupeNumberDisplay) :
                    await helpers.translate("{0} CI removed from task. De-duplication task created {1}", successCount, deDupeNumberDisplay);

                if (deDupeTaskNumber && deDupeUrl) {
                    txtLinkProp = {
                        "label": deDupeTaskNumber,
                        "href": deDupeUrl
                    };
                }
            }
            const notificationId = 'successId' + new Date().valueOf();
            notifications.push({
                ...SUCCESS_NOTIFICATION_PROPS,
                "content": messageContent,
                "textLinkProps": txtLinkProp,
                "id": notificationId
            });
        }
        if (failureCount > 0) {
            notifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "content": await helpers.translate("Unable to update {0} CIs", failureCount)
            });
        };
        if (notifications.length > 0) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: notifications
            });
        }

        if (notifications.length > 0) {
            notifications.forEach(item => {
                handleRemoveNotifications(api.emit, item.id, helpers);
            });
        }
    }
}
