(function process(env) {
	
	function updateHeaderRecord(id) {
		var gr = new GlideRecordSecure('sys_ux_page_property');
		gr.addQuery('name', 'chrome_header');
		gr.addQuery('page', id);
		gr.addNullQuery('route');
		gr.query();
		if (gr.next()) {
			var header = JSON.parse(gr.getValue('value'));
			header.privatePage.searchEnabled = env.getArguments().searchPrivate;
			header.publicPage.searchEnabled = env.getArguments().searchPublic;
			gr.setValue('value', JSON.stringify(header));
			return gr.update();
		}		
		return false;		
	}
			
  var header = updateHeaderRecord(env.getArguments().sysId);
  return {
	sysId: header,
	searchPrivate: (env.getArguments().searchPrivate) ? true : false,
	searchPublic: (env.getArguments().searchPublic) ? true : false
   };

})(env);
