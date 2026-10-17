/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const fieldProp = api.context.props.field;

  if (fieldProp && fieldProp.readonly)
    return fieldProp.readonly === 'true';

  return false;
}
