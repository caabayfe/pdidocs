(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.variable_width_props = {};
    g_scratchpad.variable_width_props.single_line_text = gs.getProperty('glide.sc.single_line_text_width');
    g_scratchpad.variable_width_props.multi_line_text = gs.getProperty('glide.sc.multi_line_text_width');
    g_scratchpad.variable_width_props.wide_line_text = gs.getProperty('glide.sc.wide_line_text_width');
    g_scratchpad.variable_width_props.checkbox = gs.getProperty('glide.sc.checkbox_width');
    g_scratchpad.variable_width_props.yes_no = gs.getProperty('glide.sc.yes_no_width');
    g_scratchpad.variable_width_props.ui_page = gs.getProperty('glide.sc.ui_page_width');
    g_scratchpad.variable_width_props.html = gs.getProperty('glide.sc.html_width');
    g_scratchpad.variable_width_props.ip = gs.getProperty('glide.sc.ip_width');
    g_scratchpad.variable_width_props.macro = gs.getProperty('glide.sc.macro_width');
    g_scratchpad.variable_width_props.macro_with_label = gs.getProperty('glide.sc.macro_with_label_width');
    g_scratchpad.variable_width_props.list_collector = gs.getProperty('glide.sc.list_collector_width');
    g_scratchpad.variable_width_props.select_box = gs.getProperty('glide.sc.select_box_width');
    g_scratchpad.variable_width_props.lookup_select_box = gs.getProperty('glide.sc.lookup_select_box_width');
    g_scratchpad.variable_width_props.multiple_choice = gs.getProperty('glide.sc.multiple_choice_width');
    g_scratchpad.variable_width_props.lookup_choice = gs.getProperty('glide.sc.lookup_multiple_choice_width');
    g_scratchpad.variable_width_props.scale = gs.getProperty('glide.sc.scale_width');
    g_scratchpad.variable_width_props.reference = gs.getProperty('glide.sc.reference_width');
    g_scratchpad.variable_width_props.date = gs.getProperty('glide.sc.date_width');
    g_scratchpad.variable_width_props.date_time = gs.getProperty('glide.sc.date_time_width');
    g_scratchpad.variable_width_props.masked = gs.getProperty('glide.sc.masked_width');
    g_scratchpad.variable_width_props.email = gs.getProperty('glide.sc.email_width');
    g_scratchpad.variable_width_props.url = gs.getProperty('glide.sc.url_width');
    g_scratchpad.variable_width_props.duration = gs.getProperty('glide.sc.duration_width');
    g_scratchpad.variable_width_props.attachment = gs.getProperty('glide.sc.attachment_width');
    g_scratchpad.max_choices_lookup_choice = gs.getProperty("glide.sc.lookup.max_choices", "10000");

    // Fetch current sys_id of cat_item
    var catItemSysId = '' + current.cat_item;
    g_scratchpad.is_record_producer = false;
    if (JSUtil.notNil(catItemSysId)) {
        var catItem = current.cat_item.getRefRecord();
        if (catItem && catItem.isValidRecord()) {
            if (catItem.instanceOf('sc_cat_item_producer')) {
                g_scratchpad.is_record_producer = true;
                if (current.isNewRecord() && JSUtil.nil(current.record_producer_table + ''))
                    current.setValue('record_producer_table', catItem.getValue('table_name'));
            }
        }
    }
    var variableSetSysId = '' + current.variable_set;
    g_scratchpad.is_composite_record_producer = false;
    if (JSUtil.notNil(variableSetSysId) && GlidePluginManager.isActive("com.glideapp.servicecatalog.composite_record_producer")) {
        var vsGr = new GlideRecord("item_option_new_producer_set");
        if (vsGr.get(variableSetSysId)) {
            g_scratchpad.is_composite_record_producer = true;
            if (current.isNewRecord() && JSUtil.nil(current.record_producer_table + ''))
                current.setValue('record_producer_table', vsGr.getValue('table_name'));
        }
    }

})(current, previous);
