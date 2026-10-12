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
    if (!api.data.email_notification_settings_record.result || Object.keys(api.data.email_notification_settings_record.result).length === 0) {
        api.setState("email_digest_enabled", false);
        api.setState("custom_hours", '0');
        api.setState("custom_minutes", '15');
        api.setState("threshold", '15');
        return;
    }

    var currentRecord = api.data.email_notification_settings_record.result;

    var emailDigestValue = currentRecord.enable_email_digest.value;
    var hours = currentRecord.custom_hours.value;
    var minutes = currentRecord.custom_minutes.value;
    var threshold = currentRecord.threshold.value;
    
    api.setState("email_digest_enabled", emailDigestValue);
    api.setState("custom_hours", hours);
    api.setState("custom_minutes", minutes);
    api.setState("threshold", threshold);
}
