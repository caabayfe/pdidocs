/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var propValue = api?.data?.read_security_banner_announcement_setting_property?.output;
    if (!propValue)
        return "Turning on the security banner announcements is crucial to help admin maintain a secure instance and a functioning business. Turning security banner announcements on enables ServiceNow to alert admins of any major security threats that occur outside of release cycles. Turning this tool on will allow banner announcements to be surfaced directly on your instance in the event of a major security threat. These announcements will allow admins to address the risk immediately to keep your instance safe and secure.";
    else
        return "Announcements are turned on to alert admins to keep your instance secure and maintain a functioning business. Security banner announcements will enable ServiceNow to alert admins of any major security threats that occur outside of release cycles. This tool will allow banner announcements to be surfaced directly on your instance in the event of a major security threat. These announcements will allow admins to address the risk immediately to keep your instance safe and secure.";
}
