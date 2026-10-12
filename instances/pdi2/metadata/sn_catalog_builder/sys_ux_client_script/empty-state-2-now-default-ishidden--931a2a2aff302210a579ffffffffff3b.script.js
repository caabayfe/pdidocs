/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const fieldProp = api.context.props.field;
  const editMode = fieldProp.editMode;
  if (fieldProp && !(fieldProp.readonly === true || fieldProp.readonly === 'true') && !editMode){
    return false;
  }
  return true;
}
