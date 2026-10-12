/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const { html='', vars='{}' } = api.context.props;

    function compileTemplate(html, vars) {
        const regex = /{{(.+?)}}/g;
        let match;
        while ((match = regex.exec(html)) != null) {
            const expr = match[0];
            const varName = match[1].trim();
            html = html.replace(new RegExp(expr, 'g'), vars[varName]);
        }
        return html;
    }
    const compiled = compileTemplate(html, JSON.parse(vars));
    // console.log('compiled html', compiled);
    return compiled;
}
