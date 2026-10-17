(function(context, pageParams, blockcontext, dataParams) {
    var props = JSON.parse(context.props_details.component_properties);
    props.disabled = !gs.hasRole('dashboard_admin');
    context.props_details.component_properties = JSON.stringify(props);
})(context, pageParams, blockcontext, dataParams);
