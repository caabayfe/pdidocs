(function executeRule(current, previous /*null when async*/ ) {

    // security checks added to the following fields of UI pages
    var HTML_FIELD = "html";
    var PROCESSING_SCRIPT_FIELD = "processing_script";
    var FIELDS_ARRAY = [HTML_FIELD, PROCESSING_SCRIPT_FIELD];

    var moreInfoMsgLink = '<a target="_blank" href="' + gs.getProperty('help.base.servicenow') + 'ui+pages">' + gs.getMessage("More Info") + '</a>';

    var GLOBAL_SCOPE = 'global';

    function showInfoMessage(current, msg_tag, className) {
        var tableName = current.getRecordClassName();
        var td = GlideTableDescriptor.get(tableName);
        var field1HTML = '"' + td.getElementDescriptor(HTML_FIELD).getLabel() + '"';
        var field2Script = '"' + td.getElementDescriptor(PROCESSING_SCRIPT_FIELD).getLabel() + '"';

        gs.addInfoMessage(sn_i18n.Message.getMessage(msg_tag, "We recommend UI Page use GlideRecordSecure instead of {class_name} API in {field1_html} and {field2_script} fields {more_info_link}", {
            more_info_link: moreInfoMsgLink,
            field1_html: field1HTML,
            field2_script: field2Script,
            class_name: className
        }));
    }

    // define ui page name depending on scope
    var uiPageName = '';
    if (current.sys_scope == GLOBAL_SCOPE) {
        uiPageName = current.name;
    } else {
        uiPageName = current.sys_scope.scope + '_' + current.name;
    }

    // redirects to sys_public_list.do and encodes ui page name (in case of special characters)
    var publicPageURI = "/sys_public_list.do?sysparm_query=page=" + encodeURIComponent(uiPageName);
    var publicRecordLink = '<a target="_blank" href="' + publicPageURI + '">' + gs.getMessage("See configuration") + '</a>';

    // check if public 
    var isPublicPage = GlidePublicPage.isPublic(uiPageName);
    if (isPublicPage)
        gs.addInfoMessage(sn_i18n.Message.getMessage("ui_page_is_public_msg", "This is a public page as configured here {more_info_link}", {
            more_info_link: publicRecordLink
        }));

    var resourceSupport = new SNC.GlideResourceSupport();

    // check if ACL defined
    var aclDefined = resourceSupport.aclRuleExists(uiPageName, 'ui_page', 'read');

    // don't show security messages if public page
    if (isPublicPage) {
        // if ACLs defined for public pages, show message
        if (aclDefined)
            gs.addInfoMessage(gs.getMessage("One or more Access controls are configured for this UI Page. We do not honor them for a public UI Page"));

        return;
    }

    // don't show security messages if certain conditions match
    if (!resourceSupport.shouldShowSecurityMessages(current))
        return;

    // check if using GlideRecord instead of GlideRecordSecure
    if (resourceSupport.containsClass(current, FIELDS_ARRAY, "GlideRecord"))
        showInfoMessage(current, "ui_page_gr_msg", "GlideRecord");

    // check if using GlideDBQuery instead of GlideRecordSecure
    if (resourceSupport.containsClass(current, FIELDS_ARRAY, "GlideDBQuery"))
        showInfoMessage(current, "ui_page_gdbq_msg", "GlideDBQuery");

    if (!aclDefined)
        gs.addInfoMessage(sn_i18n.Message.getMessage("ui_page_acl_msg", "We recommend you add a role based Access Control to the UI Page {more_info_link}", {
            more_info_link: moreInfoMsgLink
        }));

})(current, previous);
