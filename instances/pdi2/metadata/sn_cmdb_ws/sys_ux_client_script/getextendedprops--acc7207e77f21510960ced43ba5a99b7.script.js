function script({ api, event, helpers, imports }) {
    //getExtendedProps script in (CI) Properties UI Controller; fired after the ciSysid input prop changes
    //infer current selection from input props
    //both ci and class populated with connection empty empty means they want CI data
    let ciSelected = !!api.context.props.ciSysid && !!api.context.props.ciClass && !api.context.props.connectionId;
    //all 3 props empty means hide cards and show (no results) graphic
    let mapBackgroundSelected = !api.context.props.ciSysid && !api.context.props.connectionId;
    //trigger ext props broker or get from cache
    var ci = api.state.cache[event.payload.value];
    if (event.payload.name === "timestamp" || (ciSelected && (!ci || !ci.extended_properties))) { //trigger extended props broker if not in cache (when ci selected)
        api.setState('extPropsBrokerInputs', {
            ciSysid: api.context.props.ciSysid,
            ciClass: api.context.props.ciClass
        });
    } else if (ciSelected) { //get from cache
        api.setState('ciExtendedProperties', ci.extended_properties);
    }
}
