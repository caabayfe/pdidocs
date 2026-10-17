(function(context, pageParams, blockcontext, dataParams) {
    var props = JSON.parse(context.props_details.component_properties);
    props.disabled = !(gs.hasRole('form_admin') && gs.hasRole('personalize_form'));
    context.props_details.component_properties = JSON.stringify(props);
})(context, pageParams, blockcontext, dataParams);
