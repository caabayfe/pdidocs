(function(context) {
    var aggregateGr = new GlideAggregate('sys_cs_custom_adapter_property');
    aggregateGr.addQuery('name', 'CONTAINS', 'callback_topic_id');
    aggregateGr.addQuery('value', "!=", "");
    aggregateGr.addQuery('document_table', 'sys_cs_channel');
    aggregateGr.addAggregate('COUNT');
    aggregateGr.query();
    var count = aggregateGr.next() ? aggregateGr.getAggregate('COUNT') : 0;

    context.props_details.show_border=true;
	context.props_details.footer_text = gs.getMessage("Callback channels ({0})", count);
})(context);
