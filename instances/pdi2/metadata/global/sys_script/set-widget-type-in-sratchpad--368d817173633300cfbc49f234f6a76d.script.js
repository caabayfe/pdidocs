(function executeRule(current, previous /*null when async*/ ) {
    // Set widget type to show/hide elements filter tab
    g_scratchpad.widget_type = current.widget.type;

    // show localised message in elements filter tab
    g_scratchpad.info_message_widget_indicator = gs.getMessage('The Elements filter applies personalization to the first breakdown of indicators that support the aggregate view. For other indicators, select a filter that returns only one element.');
    g_scratchpad.warning_message_widget_indicator = gs.getMessage('The selected indicator does not support the aggregate view. Select an Elements filter that returns only one element.');
})(current, previous);
