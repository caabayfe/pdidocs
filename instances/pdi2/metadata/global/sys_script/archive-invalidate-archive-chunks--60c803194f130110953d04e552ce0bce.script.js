
    if (!GlideTableDescriptor.isValid(current.table)) {
        gs.info('No Archive table for ' + current.table);
    } else {
      var chunk = new GlideRecord('sys_archive_run_chunk');
      chunk.addQuery('rule_id', current.sys_id);
      chunk.addQuery('state', 'waiting');
      chunk.query();
      if(chunk.hasNext()) {
        chunk.setValue('state', 'not_needed');
        chunk.updateMultiple();
      }
    }
