function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        getOrigin,
        getClipboard,
        getTrimmedValue
    } = imports["sn_km_uib.Article actions include"]();
    var permalink = getOrigin() + '/now/virtual-agent/content/knowledge/' + api.context.props.kbId;
    api.setState("pageLink", permalink);
}
