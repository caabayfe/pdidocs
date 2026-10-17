(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'list',
        fields: {
            table: "clone_data_preserver"
        },
        params: {
			aceNav:"clone_data_preserver",
			t: new GlideDateTime().getNumericValue()
        }
    };
})(context, pageParams);
