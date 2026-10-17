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
    try {
        if (api.state.isNewRecord || !api.data.gform.nowRecordFormBlob || api.context.props.payload.props_details.table !== 'sn_ace_content_block_type')
            return;

        let subPageUrl = '';

        const snAceAppConfigGlideRecord = api.data.app_config_gliderecord.output.data.GlideRecord_Query.sn_ace_app_config._results[0];
        const appId = snAceAppConfigGlideRecord.app_config.value;

        const isUIBSubPageCreated = api.data.ux_app_route_gliderecord.output && api.data.ux_app_route_gliderecord.output.data.GlideRecord_Query.sys_ux_app_route._results.length > 0;
        if (isUIBSubPageCreated) {
            const uxAppRouteGlideRecord = api.data.ux_app_route_gliderecord.output.data.GlideRecord_Query.sys_ux_app_route._results[0];
            if (!uxAppRouteGlideRecord)
                return;
            subPageUrl = `/now/build/ui/apps/${appId}/pages/${uxAppRouteGlideRecord.screen_type.value}?parentElementId=viewport_anb&sysparm_query_no_domain=false&isHeadlessViewport=true`;
        } else {
            const viewportMacroponentId = JSON.parse(snAceAppConfigGlideRecord.context.value).content_block_id;
            const requestBody = {
                "name": api.data.gform.nowRecordFormBlob.formFieldValues.name.value,
                "route": api.data.gform.nowRecordFormBlob.formFieldValues.route.value,
                "isActive": true,
                "order": 2200,
                "icon": '',
                "fields": [],
                "parentMacroponent": viewportMacroponentId,
                "parentMacroponentCompositionElementId": 'viewport_anb'
            };
            try {
                const resource = await helpers.snHttp(`api/now/builder/apps/${appId}/pages`, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                });
                const {
                    result
                } = resource.response;
                const {
                    screenType,
                    id,
                    contextState: {
                        parent
                    }
                } = result;
                subPageUrl = `/now/build/ui/apps/${appId}/pages/${screenType}?parentScreenId=${parent.id}&parentElementId=viewport_anb&sysparm_query_no_domain=false&isHeadlessViewport=true`;
            } catch ({
                error
            }) {
                console.error(error);
            }
        }
        if (subPageUrl)
            api.setState('uibSubPageUrl', subPageUrl);
    } catch ({ error }) {
        console.error(error);
    }


}
