(function executeRule(current, previous /*null when async*/) {
  if ((current.operation() == 'insert' || current.operation() == 'update')) {
	var gr = new GlideRecord("viz_map_source");
	gr.addQuery("table", current.table);
	gr.addNullQuery("parent");
	gr.query();
	if(gr.hasNext() ) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Mapping source exists for {0}', current.table));
	}
  }
})(current, previous);
