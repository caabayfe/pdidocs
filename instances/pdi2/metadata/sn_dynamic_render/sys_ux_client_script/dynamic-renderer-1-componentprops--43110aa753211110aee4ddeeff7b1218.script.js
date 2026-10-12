/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    function isJsonString(str) {
        try {
            if (str === null || str === 'null') return false;
            const result = JSON.parse(str);
            if (typeof result !== 'object') return false;
            return true;
        } catch (e) {
            return false;
        }
        return false;
    }
    let props = api.context.props.json;
    if (isJsonString(api.context.props.json)) {
        props = JSON.parse(api.context.props.json);
    }
    props.userInfo = api.context.session.user;
    return props;
}
