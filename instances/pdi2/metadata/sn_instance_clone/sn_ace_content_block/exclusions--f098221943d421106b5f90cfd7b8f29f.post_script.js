(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'list',
        fields: {
            table: "clone_data_exclude"
        },
        params: {
			aceNav:"clone_data_exclude",
			t: new GlideDateTime().getNumericValue()
        }
    };
})(context, pageParams);
