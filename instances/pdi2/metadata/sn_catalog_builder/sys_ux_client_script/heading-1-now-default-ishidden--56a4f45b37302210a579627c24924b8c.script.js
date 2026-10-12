/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const fieldProp = api.context.props.field;
  const listCount = api.state.listCount;

  if (fieldProp && (fieldProp.readonly === true || fieldProp.readonly === 'true')){
    return (listCount !==0);
  }

  return true;
}
