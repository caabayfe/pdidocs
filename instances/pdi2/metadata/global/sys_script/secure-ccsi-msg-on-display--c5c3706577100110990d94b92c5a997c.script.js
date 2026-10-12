(function executeRule(current, previous /*null when async*/ ) {

    var resourceSupport = new SNC.GlideResourceSupport();
    if (!resourceSupport.shouldShowSecurityMessages(current))
        return;

    var moreInfoMsgLink = ' <a target="_blank" href="' + gs.getProperty('help.base.servicenow') + 'Script_includes">' + gs.getMessage("More Info") + '</a>';

    // remove commented lines
    var currentScript = current.script.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/.*/g, '');

    // is using GlideRecord instead of GlideRecordSecure
    var grRegEx = new RegExp('GlideRecord\\s*\\(');
    if (grRegEx.test(currentScript))
        gs.addInfoMessage(sn_i18n.Message.getMessage("ccsi_msg", "We recommend Client Callable Script Include use GlideRecordSecure instead of GlideRecord API {more_info_link}", {
            more_info_link: moreInfoMsgLink
        }));

    // is using GlideDBQuery instead of GlideRecordSecure
    var glideDBQRegEx = new RegExp('GlideDBQuery\\s*\\(');
    if (glideDBQRegEx.test(currentScript))
        gs.addInfoMessage(sn_i18n.Message.getMessage("ccsi_msg", "We recommend Client Callable Script Include use GlideRecordSecure instead of GlideDBQuery API {more_info_link}", {
            more_info_link: moreInfoMsgLink
        }));

    // check ACL
    var gr = new GlideRecord('sys_security_acl');
    gr.addActiveQuery();
    gr.addQuery('name', current.name);
    gr.addQuery('type', 'client_callable_script_include');
    gr.addQuery('operation', 'execute');
    gr.query();
    if (!gr.next())
        gs.addInfoMessage(sn_i18n.Message.getMessage("ccsi_msg", "We recommend you add a role based Access Control to the Client Callable Script Include {more_info_link}", {
            more_info_link: moreInfoMsgLink
        }));

})(current, previous);
