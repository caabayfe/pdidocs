/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const linksetProps = api.context.props.payload.props_details;
    let linksetDefaultProps = {
        "heading": {},
        "browseLink": {},
        "links": [],
        "indentLinks": true,
        "minWidth": "150",
        "width": "400",
        "size": "md",
        "variant": "secondary"
    };
    if (linksetProps) {
        Object.keys(linksetDefaultProps).forEach(function(prop) {
            if (prop in linksetProps) linksetDefaultProps[prop] = linksetProps[prop];
        });
    }
    api.setState('payload', linksetDefaultProps);
}
