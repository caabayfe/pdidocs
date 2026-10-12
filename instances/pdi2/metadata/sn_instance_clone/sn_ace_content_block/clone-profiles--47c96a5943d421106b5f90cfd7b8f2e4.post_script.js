(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'list',
        fields: {
            table: "clone_profile"
        },
        params: {
			aceNav:"clone_profile",
			t: new GlideDateTime().getNumericValue()
        }
    };
})(context, pageParams);
