/**
 * We want to transform extraParams which is generated as a fixed formated string
 * such as: 'query/parent=b424cd23c322310015519f2974d3aeed'
 * into an object, that can be consumed by form controller.
 */
function extraParamsToFormParams ({ api }) {
  const extraParams = api.context.props.inputExtraParams;
  if (extraParams) {
    const propsArray = extraParams.split("/");
    let extraParamsProp = {};
    for (let i = 0; i < propsArray.length; i += 2) {
      extraParamsProp[propsArray[i]] = propsArray[i + 1];
    }
    return extraParamsProp;
  }
}
