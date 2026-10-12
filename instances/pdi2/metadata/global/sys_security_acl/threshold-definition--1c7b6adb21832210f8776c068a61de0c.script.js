answer = (gs.nil(current.source_id)) ||
    (current.source_id.getRefRecord().canRead() && current.source_table == 'pa_datasnapshot_indicator');
