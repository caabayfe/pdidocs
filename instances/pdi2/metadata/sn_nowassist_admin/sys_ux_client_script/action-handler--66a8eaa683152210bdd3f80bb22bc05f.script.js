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
    if (event.elementId == 'aict_empty_state') {
         api.emit("NAV_ITEM_SELECTED", {
            external: {
                url:  "/now/ai-control-tower",
                target: "_blank"
            }
           
        });
        
       
    } else if(event.elementId==="deactivate_non_complaint_skills_button"){
        var skillListData= api.state.nonComplaintSkills.rows.map(item=>{return {id:item.key,domain:item.domain}});
        api.data.deactivate_non_complaint_skills.execute({skills:skillListData});
    } else if(event.elementId ==="deactivate_non_complaint_skills"){
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "successfull_bulk_deactivation",
                status: "info",
                icon: "circle-info-outline",
                content: {
                    type: "html",
                    value: await helpers.translate(`{0} non-compliant skills deactivated.`,api.state.nonComplaintSkills.rows.length)
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });
        api.setState("nonComplaintSkills",{rows:[]});
    } else if(event.elementId==="get_user_session_domain"){
        api.setState("bulkDeactivationModalTitle",await helpers.translate("Note, you are deactivating within the domain scope <b>{0}</b>.",api.data.get_user_session_domain.output.domainName));
    } else if (event.elementId == 'view_policy_detail') {
         api.emit('NAV_ITEM_SELECTED', {
        route: 'view-policy-details',
        params: {
            payload: api.state.viewDetailPayload
        },
    });
    }
    else {
    api.emit("NAV_ITEM_SELECTED", {
        route: 'edit-provider',
        reload: true
    });
    }

}
