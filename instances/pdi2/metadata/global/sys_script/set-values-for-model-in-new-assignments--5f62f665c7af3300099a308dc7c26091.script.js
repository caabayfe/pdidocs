(function executeRule(current, previous /*null when async*/ ) {

    if (current.isNewRecord()) {
        var query = RP.getParameterValue("sysparm_fixed_query");
        var eq = new GlideQueryString(query);
        eq.deserialize();
        var terms = eq.getTerms();
        var it = terms.iterator();

        while (it.hasNext()) {
            var term = it.next();
			var field = term.getTermField();
			var value = term.getValue();
            current.setValue(field, value);
			
			if (field == 'form_position' && value == 'action_bar') {
				current.setValue('declarative_action_type', 'uxf_client_action');
			}
        }
    }

})(current, previous);
