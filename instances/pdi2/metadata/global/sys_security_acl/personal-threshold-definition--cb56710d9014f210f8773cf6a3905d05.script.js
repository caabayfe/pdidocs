answer = current.isNewRecord() || (current.source_id.getRefRecord().canRead() && current.source_table == 'pa_datasnapshot_indicator' && current.owner == gs.getUserID());
