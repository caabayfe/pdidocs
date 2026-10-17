/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api}) {
    const pageProps = {};
    Object.keys(api.context.props).forEach(function(propName) {
        if (api.context.props[propName])
            pageProps[propName] = api.context.props[propName];
    });
    api.setState("pageParams", pageProps);
}
