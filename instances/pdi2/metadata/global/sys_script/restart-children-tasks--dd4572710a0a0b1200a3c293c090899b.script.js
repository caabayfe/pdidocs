(function(current, previous) {
  var gr = new GlideRecord('sc_task');
  gr.addQuery('request_item', current.sys_id);
  gr.query();
  while (gr.next()) {
      if (gr.state == -5)
          continue;

      gr.setValue('state', -5);
      gr.setValue('work_end', null);
      gr.update();
  }
})(current, previous);
