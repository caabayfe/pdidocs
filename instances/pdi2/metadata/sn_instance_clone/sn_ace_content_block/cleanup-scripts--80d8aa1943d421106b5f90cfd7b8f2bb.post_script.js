(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'list',
        fields: {
            table: "clone_cleanup_script"
        },
        params: {
			aceNav:"clone_cleanup_script",
			t: new GlideDateTime().getNumericValue()
        }
    };
})(context, pageParams);
