(function executeQuery(v_table, v_query) {
	if (!v_query.isGet()) {
		// this table cannot be viewed as a list.
		gs.info(gs.getMessage("The remote table 'v_interaction_context' was queried, but it does not support list view. It can only be accessed if a single sys_id is specified."));
		return;
	}

	if (!new global.InteractionSecurityUtils().canGetInteraction(v_query.getSysId(), false))
		return;
	var row = {
		sys_id: v_query.getSysId()
	};

	var interactionContextGR = new GlideRecord('interaction_context');
	interactionContextGR.addQuery('interaction', v_query.getSysId());
	interactionContextGR.query();

	while (interactionContextGR.next()) {
		var key = interactionContextGR.getValue('name');
		var value = interactionContextGR.getValue('value');
		var col = 'u_' + key;
		row[col] = value;
	}

	v_table.addRow(row);

  })(v_table, v_query);
