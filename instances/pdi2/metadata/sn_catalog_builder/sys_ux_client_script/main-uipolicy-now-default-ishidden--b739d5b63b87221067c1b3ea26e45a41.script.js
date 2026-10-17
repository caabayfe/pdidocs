/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    const fieldProp = api.context.props.field;
    const editMode = fieldProp.editMode;
    const listCount = api.state.listCount;
    if (fieldProp && (api.state.listCount > 0 || (!(fieldProp.readonly === true || fieldProp.readonly === 'true') && editMode))) {
        return false;
    }
    return true;
}
