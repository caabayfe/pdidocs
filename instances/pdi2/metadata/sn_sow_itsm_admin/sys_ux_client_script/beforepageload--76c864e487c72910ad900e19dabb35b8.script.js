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
    let blockcontext = api.state.blockcontext;
    //update blockcontext as per your business logic.
    //For response templates container
    if (api.context.session.user.roles.includes('sn_templated_snip.template_snippet_writer') || api.context.session.user.roles.includes('admin')) {
        try {
            var response = await helpers.snHttp('api/now/stats/sn_templated_snip_note_template?sysparm_query=table%3Dincident&sysparm_count=true', {
                method: 'GET'
            });
            if (response) {
                var count = response.response.result.stats.count;
                if (count == 0)
                    blockcontext.responseTemplateStatusMsg = "<span style=\"background-color: RGB(var(--now-color_grouped--purple-0, #EFDEFA)); border-radius: 2px; padding: 0px 4px 2px 2px;\">" + await helpers.translate("No response template created") + "</span>";
                else
                    blockcontext.responseTemplateStatusMsg = "<span style=\"background-color: RGB(var(--now-color_alert--positive-0, #CADFC0)); border-radius: 2px; padding: 0px 4px 2px 2px;\">" + await helpers.translate("{0} response template(s) created", count) + "</span>";
            }
        } catch (error) {
            console.error("Error fetching response templates count:", error);
        }
    }else{
        blockcontext.responseTemplateStatusMsg = "";
    }

    api.emit('ACE_PAGE_READY', {
        blockcontext
    });
}
