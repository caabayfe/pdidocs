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
    
    let advancedStageLinks = [];
    let _url = "";
    if(api.data.landing_stage.output)
        advancedStageLinks = api.data.landing_stage.output.right_nav_links || [];
    try {
        switch (event.elementId) {
            case 'get_va_plugin':
                _url = "/nav_to.do?uri=$allappsmgmt.do?sysparm_search=com.glide.cs.chatbot";
                break;
            case 'get_itsm_plugin':
                _url = "https://store.servicenow.com/sn_appstore_store.do#!/store/application/134450a0b3781300787162ac16a8dc1e";
                break;
            case 'get_csm_plugin':
                _url = "/nav_to.do?uri=$allappsmgmt.do?sysparm_search=com.sn_csm.virtualagent";
                break;
            case 'get_hr_plugin':
                _url = "https://store.servicenow.com/sn_appstore_store.do#!/store/application/c8c5545573d8130000e588e54cf6a71a";
                break;
            case 'open_prvw_va_btn':
                _url = "/$conversation-builder.do#/";
                break;
            case 'learn_srch_settings_btn':
                _url = "https://docs.servicenow.com/csh?topicname=va-ai-search.html&version=page/administer/virtual";
                break;    
            case 'view_portal_settings':
                _url = api.state.portal_details.settings_link;
                break;
            case 'open_portal':
                _url = api.state.portal_details.portal_link;
                break;
            case 'designer_icon':
                if(advancedStageLinks.length > 0 && advancedStageLinks[0].actions && advancedStageLinks[0].actions.link_url)
                    _url = advancedStageLinks[0].actions.link_url;
                break;
            case 'tr_icon':
                if(advancedStageLinks.length > 1 && advancedStageLinks[1].actions && advancedStageLinks[1].actions.link_url)
                    _url = advancedStageLinks[1].actions.link_url;
                break;
            case 'analytics_icon':
                if(advancedStageLinks.length > 2 && advancedStageLinks[2].actions && advancedStageLinks[2].actions.link_url)
                    _url = advancedStageLinks[2].actions.link_url;
                break;
        }
    } catch (e) {}
  
    const { navigateTo } = imports["global.CiRoutingUtils"]();
    navigateTo(api, { external : { url : _url } });
    if (event.elementId.includes("plugin")) {
        api.emit('MODAL_SELECTED', {
            modalId: "[component-id$='refresh_console']",
            showModal: true,
            bare: true,
            displayOptions: {
                size: "sm"
            },
            prepreserveState: false
        });
    }
}
