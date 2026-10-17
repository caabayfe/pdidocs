(function(context, pageParams, blockcontext, dataParams) {
    var props = JSON.parse(context.props_details.component_properties);
    props.disabled = !gs.hasRole('sn_templated_snip.template_snippet_writer');
    context.props_details.component_properties = JSON.stringify(props);
})(context, pageParams, blockcontext, dataParams);
