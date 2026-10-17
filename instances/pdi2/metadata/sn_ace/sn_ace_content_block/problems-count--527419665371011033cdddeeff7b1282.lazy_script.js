(function(context) {
    var gr = new GlideRecord("sys_script_include");
    gr.query();
    context.props_details.footer_text = 'Lazily evaluated - scripts count (' + gr.getRowCount() + ')';
})(context);
