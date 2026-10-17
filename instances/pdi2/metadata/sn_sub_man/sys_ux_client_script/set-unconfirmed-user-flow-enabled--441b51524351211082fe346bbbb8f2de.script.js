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
    const result = api.data.look_up_unconfirmed_user_property.result;
    if (!result || result.length == 0) {
        api.setState('unconfirmed_user_flow_enabled', false);
        return;
    }
    //Convert string to boolean
    const isEnabled = result.value.value.toLowerCase() == 'true';
    api.setState('unconfirmed_user_flow_enabled', isEnabled);
    const params = {sm: api.context.props.sm, menu: api.context.props.menu};
    if (isEnabled) {
        if ((api.context.props.menu === 'unconfirmedgroups') || (api.context.props.menu === 'incompatibleusers') || (!api.context.props.menu)) {
            api.setState('issuesTabID', 't0');
            params['menu'] = 'unconfirmedgroups';
        }        
    } else {
        if (api.context.props.menu === 'unconfirmedgroups' || (api.context.props.menu === 'incompatibleusers')){
            api.setState('issuesTabID', 't1');
            params['menu'] = 'customtables';
        }    
    }
    // params must be updated if currently on issues tab 
    if(api.context.props.sm === 'issues'){
            api.emit("CONTENT_UPDATED", {
            params
        });
    }

}
