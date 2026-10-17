/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var paraOpen = "<p>";
    var paraClose = "</p>";
    var paraCloseAndOpen = "</p><p>";

    // The following variables sentence1 and sentence2 are added manually to required_translations in the final sys_ux_client_script file as these were not added automatically by the UI Builder because of the presence of commas
    var sentence1 = helpers.translateSync("To grant access, it is sufficient for only one ACL to pass. Roles are evaluated first, then Condition and lastly Scripts. If Roles are blocked, Condition and Scripts are skipped.");
    var sentence2 = helpers.translateSync("At a table level, ACL's are evaluated only for roles and security attributes, conditions and scripts are not evaluated.");
    var sentence3 = helpers.translateSync("Learn more on our");
    var linkText = helpers.translateSync("ACL document page.");
    var link = " <a style=\"color: rgb(var(--now-color--link-2))\" href=\"/api/now/v1/context_doc_url/CSHelp:create-acl-rule\" target=\"_blank\">" +
        linkText + "</a>";
    var sentenceThreeWithLink = sentence3 + link;

    return paraOpen + sentence1 + paraCloseAndOpen + sentence2 + paraCloseAndOpen + sentenceThreeWithLink + paraClose;
}
