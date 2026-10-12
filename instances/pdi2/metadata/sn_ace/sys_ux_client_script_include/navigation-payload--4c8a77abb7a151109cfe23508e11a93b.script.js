function include( {imports} ) {

    // Prepare navigation payload with route, required params (fields) and optional params (params)
    const generateNavigationPayload = (endpoint, currentRouteRequiredParams, currentRouteOptionalParams, canReloadPage = true) => {
        try {
            if (!endpoint)
                return null;

            let payload = {
                reload: canReloadPage
            };
            const [route, params] = endpoint.split('?');
            if (!route)
                return null;

            payload.route = route;
            if (params) {
                payload.fields = {};
                const allParams = params.split('&');
                allParams.forEach(param => {
                    if (param.match(/optional=(.+)/)) {
                        payload.params = {};
                        let optionalParams = param.match(/optional=(.+)/)[1].split('^');
                        optionalParams.forEach(optionalParam => {
                            const [optionalParamName, optionalParamValue] = optionalParam.split('=');
                            payload.params[optionalParamName] = getParamValue(optionalParamValue, currentRouteOptionalParams);
                        });
                    } else {
                        const [paramName, paramValue] = param.split('=');
                        payload.fields[paramName] = getParamValue(paramValue, currentRouteRequiredParams);
                    }
                });
            }
            return payload;
        } catch (error) {
            console.error('[ACE] ERROR generating navigation payload');

            return null;
        }
    }

    const areEqual = (o1, o2) => {
        let obj1 = o1 || {};
        let obj2 = o2 || {};

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length)
            return false;

        for (let key1 of keys1) {
            if (obj1[key1] !== obj2[key1])
                return false;
        }
        return true;
    }

    const isEndpointUrlLoaded = (endpoint, {
        route,
        fields,
        params
    }) => {
        const payloadFromEndpoint = generateNavigationPayload(endpoint, fields, params);

        if (!payloadFromEndpoint || payloadFromEndpoint.route !== route || !areEqual(payloadFromEndpoint.fields, fields) || !areEqual(payloadFromEndpoint.params, params))
            return false;

        return true;
    }

    // Replace placeholder template text with current route parameters 
    const getParamValue = (template, currentRouteParams) => {
        const templateMatches = template.match(/{(.+)}/);
        if (!templateMatches)
            return template;

        const matchedName = templateMatches[1];
        return currentRouteParams[matchedName] || '';
    }

    return {
        generateNavigationPayload,
        isEndpointUrlLoaded
    };
}
