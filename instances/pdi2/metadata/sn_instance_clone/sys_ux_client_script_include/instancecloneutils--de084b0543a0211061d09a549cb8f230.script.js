function include({imports}, api) {
    function navigateToList(api, table, params) {
        const payload = getNavPayload({
            route: 'list',
            fields: {
                'table': table
            },
            params: params || {}
        });
        api.emit('NAV_ITEM_SELECTED', payload);
    }
    
    function loaderComponent(show) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: show,
            label: "Loading...",
            action: null,
            nonBlocking: false
        });
    }


    function navigateToPage(api, page, fields={}, params={}) {
        const payload = getNavPayload({
            route: page,
            fields: fields,
            params: params
        });
        api.emit('NAV_ITEM_SELECTED', payload);
    }

    function getNavPayload({
        route,
        fields,
        params
    }) {
        if (!params) {
            params = {};
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
            external: null
        };
    }
    
    return {navigateToList, navigateToPage,loaderComponent};
}
