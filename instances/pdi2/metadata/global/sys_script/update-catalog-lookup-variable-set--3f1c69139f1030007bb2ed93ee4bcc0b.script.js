updateMatcherAndSetter();


function updateMatcherAndSetter() {
   var tables = [ 'catalog_dl_definition_rel_mat', 'catalog_dl_definition_rel_set' ];
   
   for (var i=0; i < tables.length; i++) {
	  var gr = new GlideRecord(tables[i]);
	  gr.addQuery('dl_definition', current.getUniqueValue());
	  gr.query();
	  while (gr.next()) {
		 gr.variable_set = current.variable_set;
		  gr.catalog_item = '';
		 gr.update();
	  }
   }
}
