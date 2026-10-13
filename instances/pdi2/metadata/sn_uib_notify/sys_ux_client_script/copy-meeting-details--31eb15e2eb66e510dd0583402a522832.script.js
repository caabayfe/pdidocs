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
    const data = api.data.get_conference_initial_details.output;
    if (!data) {
        return;
    }
    const conferenceDetails = data.conferenceDetails;
    if (conferenceDetails && conferenceDetails.call && conferenceDetails.call.invite) {
        helpers.writeText(conferenceDetails.call.invite);
        const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
        let message = await helpers.translate("Copy meeting details successful");
        notifyConfUtils.showAlert(api, message, "info");
    }
}
