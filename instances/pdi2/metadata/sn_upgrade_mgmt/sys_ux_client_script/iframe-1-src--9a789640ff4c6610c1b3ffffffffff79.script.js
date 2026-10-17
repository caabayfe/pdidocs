/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let url = api.context.props.experienceProperties.url.value;
    const regex = /^(\/|\/\/)/;

    if (regex.test(url))
        return url;
    else {
        try {
            const fnConstr = (function() {}).constructor;
            const windowObject = fnConstr('return this')();
            url = new windowObject.URL(url);
            //remove host from url
            return (url.pathname + url.search + url.hash);
        } catch (e) {
            console.log('Error occured while returning url for iframe' + e);
        }
    }
}
