(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
      var gr = new GlideRecord('ais_datasource_attribute');
      gr.addQuery('datasource', current.datasource);
      gr.addQuery('source', current.source);
      gr.addQuery('attribute', current.attribute);
      gr.addQuery('sys_id', '!=', current.getUniqueValue());
      gr.query();
      if (gr.next()) {
          current.setAbortAction(true);
          gs.addErrorMessage(gs.getMessage( "{0} already exists for {1}", [GlideStringUtil.escapeHTML(current.attribute.attribute), GlideStringUtil.escapeHTML(current.source)]));
      }
})(current, previous);
