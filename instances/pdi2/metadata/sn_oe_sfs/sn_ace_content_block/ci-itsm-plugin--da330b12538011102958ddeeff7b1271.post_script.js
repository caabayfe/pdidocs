(function(context) {
    context.props_details.link = CIPlugin.ITSM().getAppLink();
	  context.props_details.variant="primary";
    context.props_details.plugin_title = {
        inline_style: "width:100%;",
        title: gs.getMessage('IT Service Management (ITSM)')
    }
})(context);
