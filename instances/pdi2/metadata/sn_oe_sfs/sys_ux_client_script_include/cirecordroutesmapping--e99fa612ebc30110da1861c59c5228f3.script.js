function include({ imports }) {
    const buildDefaultRoutePayload = (route, defaultTargetRoute, event, domainId = undefined) => {
        const { table, sysId, params, multiInstField, title, passiveNavigation, redirect, targetRoute, external } = _getPayloadParams(event, domainId);

        return {
            "route": route,
            "targetRoute": (targetRoute || targetRoute === '') ? targetRoute : defaultTargetRoute, 
            "fields": { "table": table, "sysId": sysId },
            "params": params,
            "redirect": redirect,
            "passiveNavigation": passiveNavigation,
            "title": title,
            "multiInstField": multiInstField,
            "external": external
        };
    };

    const routeMapping = (routeMap, defaultRoutePayload, event, domainId = undefined) => {
        const { elementId, sourceActionId, table, sysId, params, multiInstField, title } = _getPayloadParams(event, domainId);
        const { payload } = event;
        var tableRoute;
        if (routeMap)
            tableRoute = routeMap[table];

        var param_payload = defaultRoutePayload;
        if (tableRoute && elementId) {
            Object.keys(tableRoute).map((key) => {
                if (elementId.includes(key) || (sourceActionId && sourceActionId.includes(key))) {
                    param_payload = tableRoute[key].payload;
                    var pattern = /\{\{([^}]+)\}\}/ig;
                    var matches = param_payload.match(pattern);
                    matches.forEach(
                        function(token) {
                            var paramKey = token.substr(2, token.length - 4);
                            var newToken = "";
                            if (payload.hasOwnProperty(paramKey)) { //Handle case: e.x. payload.sysId
                                newToken = payload[paramKey];
                            } else if (payload.fields && payload.fields.hasOwnProperty(paramKey)) { //Handle case: e.x. payload.fields.sysId
                                newToken = payload.fields[paramKey];
                            } else if (payload.params && payload.params.hasOwnProperty(paramKey)) { //Handle case: e.x. payload.params.sysId
                                newToken = payload.params[paramKey];
                            }
                            param_payload = param_payload.replace(token, newToken);
                        }
                    );
                    param_payload = JSON.parse(param_payload);
                    param_payload.fields.sysId = sysId;
                    param_payload.params = params;
                    param_payload.multiInstField = multiInstField;
                    param_payload.title = title;
                }
            });
        }
        return param_payload;
    };

    const _getPayloadParams = (event, domainId) => {
        const { elementId, payload } = event;
        const { fields, params, query, row, nativeEvent, redirect = false, targetRoute, external } = payload;
        const sourceAction = payload.__sourceAction || {};
        var table = payload.table || fields.table;
        var sysId = payload.sysId || payload.sys_id || fields.sysId || fields.sys_id;
        var title = "";

        const metaKeyPressed = nativeEvent && (nativeEvent.metaKey || nativeEvent.ctrlKey);

        if (row) {
            sysId = sysId || row.sys_id.value;
            title = row.displayValue.value;
        }

        var multiInstField = sysId === '-1' ? "sysId" : "";

        var outputPayloadParams = {};
        if (params) {
            outputPayloadParams = JSON.parse(JSON.stringify(params));
            outputPayloadParams.extraParams = Object.keys(params).map((x) => { return `${x}/${params[x]}` }).join("/");
        }

        if (query) {
            outputPayloadParams.query = query;
        }

        // create or update `query` with domainId when state has domainId 
        if (domainId) {
            if (!outputPayloadParams.query)
                outputPayloadParams.query = '';

            outputPayloadParams.query += (outputPayloadParams.query ? '^' : '') + 'sys_domain=' + domainId;            
        }

        var res = {};
        res.elementId = elementId || payload.elementId;
        res.sourceActionId = sourceAction.id;
        res.table = table;
        res.sysId = sysId;
        res.params = outputPayloadParams;
        res.title = title;
        res.multiInstField = multiInstField;
        res.external = external || "";

        if (targetRoute || targetRoute === '') {
            res.targetRoute = targetRoute;   
        }

        res.passiveNavigation = metaKeyPressed;
        res.redirect = redirect;

        return res;
    };

    return ({ routeMapping, buildDefaultRoutePayload });
}
