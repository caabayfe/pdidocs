var SOWTeamManagementSNC = Class.create();
SOWTeamManagementSNC.prototype = {
	initialize: function() {
	},

	/**
	 * get dropdown filter for SRM Teams page
	 */
	getFilters: function() {
		var filters = [];
		filters.push(  {
			"filterCondition": "managerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORsys_idINjavascript:gs.getUser().getMyGroups()",
			"id": "your_teams",
			"label": gs.getMessage("Your teams"),
			"searchPlaceholder": gs.getMessage("Search your teams"),
			"subLabel": null
		});

		// add this filter if Service Reliability Management(SRM) is installed
		if (GlidePluginManager.isActive('com.snc.uib.sow_srm') && gs.hasRole("sn_sow_srm.srm_responder")){
			var srm_group_type = gs.getProperty('srm.srm_group_type', 'c419b12deb412110ea6e4ee5b552282b');
			filters.push(  {
				"filterCondition": "typeLIKE" + srm_group_type,
				"id": "all_srm_teams",
				"label": gs.getMessage("All SRM teams"),
				"searchPlaceholder": gs.getMessage("Search all SRM teams "),
				"subLabel": gs.getMessage("Lists all the teams on Service Reliability Management (SRM). Your ability to take actions in each team will depend on permissions for that team.")
			});
		}

		filters.push(  {
			"filterCondition": null,
			"id": "all_teams",
			"label": gs.getMessage("All teams"),
			"searchPlaceholder": gs.getMessage("Search all teams"),
			"subLabel": gs.getMessage("Lists all the teams you have access to view. Your ability to take actions in each team will depend on permissions for that team.")
		});

		return filters;
	},

	/**
	 * match the filters by encoded query. can match more than one
	 * @param filterIds
	 * @param encodedQuery - the filter condition
	 */
	matchFilter: function(filterIds, encodedQuery) {
		filterIds = Array.isArray(filterIds) ? filterIds : [filterIds];
		var filters = this.getFilters();
		for (i=0; i < filters.length; i++){
			var filter = filters[i];
			if (filter.filterCondition == encodedQuery)
				return filterIds.indexOf(filter.id) !== -1;
		}
		return false;
	},

	/**
	 * get teams logic
	 * - if SRM is installed, check for "Setup Pending" case for teams
	 * - if SRM is not installed, do a simple sys_user_group query
	 * - use saved "conditions" from "search dropdown"
	 * - if searchTerm, add search to the conditions.
	 * - return a simplified sys_user_group payload
	 * - support pagination
	 *
	 */
	getTeams: function(encodedQuery, searchTerm, orderBy, sortType, rowLimit, currentPage, queryCategory) {
		// handle SRM Teams "my teams" differently. only query for SRM teams with setup pending if
		// 1. SRM is active
		// 2. has SRM Role
		// 3. it is not a search result
		// 4. it is the "your teams" query
		//
		// for all other users of the Teams page, just do the standard sys_user_group query
		//
		if (GlidePluginManager.isActive('com.snc.uib.sow_srm') && gs.hasRole('sn_sow_srm.srm_responder') && !searchTerm && this.matchFilter(['your_teams'], encodedQuery))
			return new sn_sow_srm.SRMTeamManagement().getMyTeams(encodedQuery, searchTerm, orderBy, sortType, rowLimit, currentPage, queryCategory);
	
		return {
			_results: this._lookupTeams(encodedQuery, searchTerm, orderBy, sortType, rowLimit, currentPage, queryCategory),
			_rowCount: this._lookupTeamsCount(encodedQuery, searchTerm, queryCategory)
		};
	},

	/**
	 * Return all active teams
	 */
	_lookupTeams: function(encodedQuery, searchTerm, orderBy, sortType, rowLimit, currentPage, queryCategory) {
		var offset = currentPage * rowLimit || 0; // offset is 0 if NaN
		var gr = new GlideRecordSecure('sys_user_group');
		gr.addQuery('active', true);

		// filter query
		if (encodedQuery)
			gr.addEncodedQuery(encodedQuery, false);

		// search query
		if (searchTerm)
			gr.addQuery('name', 'CONTAINS', searchTerm);

		// pagination support
		if (offset && rowLimit)
			gr.chooseWindow(offset, offset + rowLimit);
		else if (rowLimit)
			gr.setLimit(rowLimit);

		// order
		if (orderBy)
			(sortType == 'desc') ? gr.orderByDesc(orderBy) : gr.orderBy(orderBy);
		
		// read replica support
		if (queryCategory)
			gr.setCategory(queryCategory);

		gr.query();

		var retval = [];
		while(gr.next()){
			retval.push(this._formatTeamRecord(gr));
		}
		return retval;
	},

	/**
	 * return count of all active teams
	 */
	_lookupTeamsCount: function(encodedQuery, searchTerm, queryCategory) {
		var count = new GlideAggregate('sys_user_group');
		count.addQuery('active', true);

		// filter query
		if (encodedQuery)
			count.addEncodedQuery(encodedQuery, true);

		// search query
		if (searchTerm)
			count.addQuery('name', 'CONTAINS', searchTerm);

		if (queryCategory)
			count.setCategory(queryCategory);

		count.addAggregate('COUNT');
		count.query();
		var retval = 0;
		if (count.next()) 
			retval = count.getAggregate('COUNT');

		return retval;
	},

	/**
	 * Format Team Record
	 * 
	 * NOTE: getDisplayName does an additional query, so only use it for 
	 *       reference fields we want to display
	 */
	_formatTeamRecord: function(gr){
		return {
			_row_data: {
				displayValue: gr.getValue('name'),
				uniqueValue: gr.getUniqueValue()
			},
			name: {
				value: gr.getValue('name'),
				displayValue: gr.getValue('name')
			},
			description: {
				value: gr.getValue('description'),
				displayValue: gr.getValue('description')
			},
			email: {
				value: gr.getValue('email'),
				displayValue: gr.getValue('email')
			},
			manager: {
				value: gr.getValue('manager'),
				displayValue: gr.getDisplayValue('manager')
			},
			is_setup_pending: {
				value: gr.getValue('is_setup_pending') || false,
				displayValue: gr.getValue('is_setup_pending') || false
			}
		};
	},
	type: 'SOWTeamManagementSNC'
};
