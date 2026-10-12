/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    const color = api.context.props.payload.value;
    if (color) {
        return `<now-icon size=\"md\" icon=\"square-fill\" style=\"color:${color}\"></now-icon>`;
    }
    return '';
}
