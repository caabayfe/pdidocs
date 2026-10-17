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
    const classicUiPrefix = /^\/now\/nav\/ui\/classic\/params\/target/;
    if (regex.test(url))
        return decodeURIComponent(url.replace(classicUiPrefix, ''));
    else {
        try {

            const fnConstr = (function() {}).constructor;
            const windowObject = fnConstr('return this')();
            url = new windowObject.URL(url);
            //remove host from url
            url = url.pathname + url.search + url.hash;
            url = url.replace(classicUiPrefix, '');
            return decodeURIComponent(url);
        } catch (e) {
            console.log('Error occured while returning url for iframe' + e);
        }
    }
}
