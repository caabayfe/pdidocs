(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'list',
        fields: {
            table: "instance"
        },
        params: {
			aceNav:"clone_instance",
            fixedFilter: "source=false",
            t: new GlideDateTime().getNumericValue()
        },
    };

})(context, pageParams);
