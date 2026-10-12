var ATFRelatedListUtil = Class.create();
ATFRelatedListUtil.prototype = Object.extendsObject(AbstractAjaxProcessor,{

	process: function() {
		if (!gs.getSession().isLoggedIn()) {
			gs.warn("Unauthenticated user attempted to access ATFRelatedListUtil");
			return null;
		}

		var name = this.getParameter('sysparm_name');
		if (name == 'getRelationshipTableName')
			return this.getRelationshipTableName(this.getParameter('sysparm_relationship_id'));
		else if (name == 'getRelatedLists')
			return JSON.stringify(this.getRelatedLists(this.getParameter('sysparm_table')));
		else if (name == 'getRelatedListLabels')
			return this.getRelatedListLabels(this.getParameter('sysparm_table'), this.getParameter('sysparm_related_list_names'));
	},

	/**
	 * Returns the table name of the given relationship
	 */
	getRelationshipTableName: function(relationshipSysId) {
		gs.log("ATFRelatedListUtil.getRelationshipTableName called with relationship sys_id: " + relationshipSysId);
		
		return sn_atf.ATFListUtil.getRelationshipTableName(relationshipSysId);
	},

	/**
	 * Returns the reference qualifier for related list 'list action' UI actions
	 */
	getListActionRefQual: function(tableName) {
		if (gs.nil(tableName))
			return "table=global^list_action=true^active=true";

		var tableHierarchy = GlideDBObjectManager.get().getTables(tableName).toString();
		tableHierarchy = tableHierarchy.substring(1, tableHierarchy.length() - 1);
		tableHierarchy += ", global";
		return "tableIN" + tableHierarchy + "^list_action=true^active=true";
	},

	/**
	 * Given a table and a comma-separated string of related list names,
	 * returns a comma-separated string of the related list labels
	 */
	getRelatedListLabels: function(tableName, relatedListNames) {
		if (gs.nil(tableName) || gs.nil(relatedListNames))
			return relatedListNames;

		var allRelatedLists = this.getRelatedLists(tableName);
		var labels = [];
		var relatedLists = relatedListNames.split(',');
		for (var i = 0; i < relatedLists.length; i += 1)
			labels.push(this.getRelatedListLabel(relatedLists[i], allRelatedLists));

		return labels.join(', ');
	},

	/**
	 * Returns the label of a given related list
	 */
	getRelatedListLabel: function(relatedListName, allRelatedLists) {
		for (var l in allRelatedLists) {
			if (allRelatedLists[l].value == relatedListName)
				return allRelatedLists[l].label;
		}

		gs.log("Unable to find related list label for related list: " + relatedListName);
		return relatedListName;
	},

	/**
	 * Populates answer object in the context with an ordered list of related lists available on the given table.
	 * Used to populate
	 */
	getRelatedListsForSlushbucket: function(tableName) {
		if (!tableName)
			return;

		var cl = this.getRelatedListChoices(tableName);
		for (var i = 0; i < cl.size(); i += 1) {
			var c = cl.getChoice(i);
			answer.add(c.getValue(), c.getLabel());
		}
	},

	/**
	 * Returns an object which is an ordered list of related lists available on the given table.
	 */
	getRelatedLists: function(tableName) {
		var answer = {};
		if (!tableName)
			return answer;

		var cl = this.getRelatedListChoices(tableName);
		for (var i = 0; i < cl.size(); i += 1) {
			var c = cl.getChoice(i);
			answer[i] = { 'value': c.getValue(), 'label': c.getLabel() };
		}

		return answer;
	},

	/**
	 * Returns a ChoiceList containing the available related lists on the given table.
	 */
	getRelatedListChoices: function(tableName) {
		var cachedRelatedListChoices = GlideController.getGlobal("atf_cached_related_list_choices");
		if (cachedRelatedListChoices && cachedRelatedListChoices.tableName == tableName)
			return cachedRelatedListChoices.choices;

		var cls = new GlideChoiceListSet();
		if (!tableName)
			return cls.getColumns();

		cls.setColumns(GlideSysForm.getRelatedTables(tableName));
		var gru = new GlideRelationshipUtil();
		gru.addChoices(tableName, cls);
		cls.sortColumns();
		var result = cls.getColumns();

		GlideController.putGlobal("atf_cached_related_list_choices", {tableName: tableName, choices: result});
		return result;
	},

    type: 'ATFRelatedListUtil'
});
