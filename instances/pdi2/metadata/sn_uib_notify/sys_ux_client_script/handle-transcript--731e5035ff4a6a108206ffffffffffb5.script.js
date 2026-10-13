/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();

    const downloadTranscript = (attachmentId) => {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: "/sys_attachment.do?sys_id=" + attachmentId
            }
        });
    };

    const showAlert = (message) => {
        if (!message) return;
        let alerts = [];
        alerts.push({
            message: message,
            level: "critical"
        });
        notifyConfUtils.showMultipleAlerts(api, alerts);
    };

    var elementId = event.elementId;
    var attachmentSysId = "";
    switch (elementId) {
        case "extract_transcript_button":
            attachmentSysId = "-1";
            break;
        case "download___attach_transcript":
            attachmentSysId = api.data.download___attach_transcript.output.attachmentId || "";
            showAlert(api.data.download___attach_transcript.output.message);
            break;
        case "download_transcript_button":
            downloadTranscript(api.state.confDetails.attachmentSysId);
            return;
    }
    api.setState("confDetails", { ...api.state.confDetails,
        attachmentSysId
    });
}
