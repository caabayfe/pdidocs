/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var iconHtml = "<now-icon icon=\"diamond-exclamation-outline\" size=\"md\"></now-icon>";
    var alertInfoText = helpers.translateSync("Alert Icon {0} in any status indicates the presence of a script in the ACL. Review highlighted ACLs to understand the final access. To know more about how these controls are evaluated and review the logic to determine the access. ", iconHtml);
    var learnMoreText = helpers.translateSync("Refer the documentation");

    
    return "<span>" +
        alertInfoText +
        "<a style=\"color: rgb(var(--now-color--link-2))\" href=\"/api/now/v1/context_doc_url/logs-access-analyzer\" target=\"_blank\">" +
        learnMoreText +
        "</a></span>";
}
