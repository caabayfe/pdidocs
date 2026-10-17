function include({ imports }) {
    return {
        navigateTo: (api, navPayload, isInAppRouting = false) => {
            //helpers.navigate.to(route, {}, {});
            api.emit("NAV_ITEM_SELECTED", {
                ...navPayload,
                reload: !isInAppRouting,
            });
        },

        getBreadcrumbNavPayload: (api, event) => {
            const bcItemPayload = event.payload.item;
            if (!bcItemPayload || !bcItemPayload.page) {
                return { route: "home" };
            }

            let _route = bcItemPayload.page;
            let _fields = {};
            if (_route.startsWith("-custom-")) {
                const splittedRoute = _route.split("#");
                _route = splittedRoute[1]; //route
                if(splittedRoute[2])
                    _fields.table = splittedRoute[2]; //table
                if (splittedRoute[3])
                    _fields.sysId = splittedRoute[3]; //sysId
            } else {
                switch (_route) {
                    case "ci-list":
                        if (api.context.props.table)
                            _fields.table = api.context.props.table;
                        break;

                    case "ci-record":
                        if (api.context.props.table)
                            _fields.table = api.context.props.table;
                        if (api.context.props.sysId)
                            _fields.sysId = api.context.props.sysId;
                        break;

                    default:
                        _fields = null;
                }
            }

            let _params = { t: Date.now() };
            if (bcItemPayload.view) _params.view = bcItemPayload.view;
            if (bcItemPayload.filter) _params.filter = bcItemPayload.filter;

            return {
                route: _route,
                fields: _fields,
                params: _params,
            };
        }
    };
}
