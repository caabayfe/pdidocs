(function(context) {
    var dateTimeGr = new GlideDateTime();
    var endDate = dateTimeGr.getDate();
    dateTimeGr.addMonthsLocalTime(-1);
    var startDate = dateTimeGr.getDate();
    context.props_details.show_border = false;
    context.props_details.show_header = false;
    context.props_details.show_total_value = true;
    context.props_details.show_metric_label = true;
    context.props_details.show_legend_value = true;
    context.props_details.show_legend_percentage = true;
    context.props_details.custom_format = true;
    context.props_details.filter_query = 'sys_idISNOTEMPTY^ORsys_id={"event_type":"Agent Zero Usage","event_name_filter":"Issue Auto Resolution","from_date":"' + startDate + '","to_date":"' + endDate + '","date_bucket":"day","timestamp":1652295945401}';
    context.props_details.type = 'Widget';
    context.props_details.description = gs.getMessage('Issue Auto Resolution (IAR) performance over the last 30 days');
})(context);
