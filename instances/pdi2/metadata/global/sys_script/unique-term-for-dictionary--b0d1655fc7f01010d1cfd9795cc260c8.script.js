(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
      var gr = new GlideRecord('ais_dictionary_term');
      gr.addActiveQuery();
      gr.addQuery('sys_id', '!=', current.getUniqueValue());
      gr.addQuery('dictionary', current.dictionary);
      gr.addQuery('term', current.term);
      gr.query();
      if (gr.next()) {
          current.setAbortAction(true);
          gs.addErrorMessage(gs.getMessage("{0} already exists for {1}", [GlideStringUtil.escapeHTML(current.term), GlideStringUtil.escapeHTML(current.dictionary.label)]));
      }
})(current, previous);
