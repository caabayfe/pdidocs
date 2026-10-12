    /**

    @param {params} params
    @param {api} params.api
    @param {any} params.event
    @param {any} params.imports
    @param {ApiHelpers} params.helpers
    */
    function handler({
        api,
        event,
        helpers,
        imports
    }) {

        const {
            name,
            payload: {
                eventName,
                eventPayload
            }
        } = event; // button clicks are handled here
        if (eventName == "VIEW_SYSTEM_MESSAGES") {
             navigateToList(api, 'sys_properties', {
                't': Date.now(),
                'view': 'ci_admin_console',
                'fixedFilter': 'sys_idDYNAMIC2ce328b2537230106d43ddeeff7b12d5'
            });
        }

        if (eventName == "VIEW_CONTEXTUAL_ACTIONS") {
                navigateToRoute(api, 'va-contextual-actions',null,
                    {
                        'channel': api.context.props.channel
                    }
                );
            }

        function navigateToList(api, table, params) {
        navigateToRoute(api, 'list', {
            'table': table
        }, params);
    }

    function navigateToRoute(api, route, fields, params) {
        api.emit('NAV_ITEM_SELECTED', getNavPayload({
            route: route,
            fields: fields,
            params: params || {}
        }));
    }

    function getNavPayload({
        route,
        fields,
        params
    }) {
        if (!params) {
            params = {};
        }
        if (!params.t) {
            params.t = Date.now();
        }

        return {
            route: route,
            fields: fields,
            params: params,
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            reload: true,
            external: null
        };
    }
}
