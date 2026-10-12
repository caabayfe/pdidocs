(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'list',
        fields: {
            table: "sn_instance_clone_mif_enabled_instance"
        },
        params: {
			aceNav:"clone_mif_instance",
			t: new GlideDateTime().getNumericValue()
        }
    };
})(context, pageParams);
