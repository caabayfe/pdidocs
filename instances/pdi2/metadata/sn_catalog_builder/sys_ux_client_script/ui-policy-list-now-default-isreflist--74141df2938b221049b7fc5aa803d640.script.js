/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const fieldProp = api.context.props.field;

    if (fieldProp && fieldProp.readonly)
        return fieldProp.readonly === 'true';

    return false;
}
