var SPMRefUtils = Class.create();
SPMRefUtils.prototype = {
	initialize: function(portfolio) {
		this.portfolio = portfolio;
	},

	getLowestLevelTaxonomyNode: function(portfolio) {
		// New Taxonomy Node model
		if (gs.getProperty('standard_portfolio_construct.turn_on') == 'true') {
			// Get list of non-leaf taxonomy nodes
			var query = "spm_service_portfolio="+portfolio+"^sys_idNOT IN";
			var grTaxNodeParents = new GlideRecord('spm_taxonomy_node');
			grTaxNodeParents.addQuery('spm_service_portfolio', portfolio);
			grTaxNodeParents.addJoinQuery('spm_taxonomy_node', 'sys_id', 'parent');
			grTaxNodeParents.query();

			while (grTaxNodeParents.next()){
				query = query.concat(grTaxNodeParents.sys_id + ',');
			}
		}
		// Support legacy Taxonomy Node layers model
		else {
			var query = "sys_idIN";
			var lowestLevel = this.getLowestLevelTaxonomy(portfolio);
			if (!lowestLevel)
				return query;
			// Return a list of taxonomy nodes with the highest order
			var gr = new GlideRecord('spm_taxonomy_node');
			gr.addQuery('spm_taxonomy_layer', lowestLevel);
			gr.query();
			while (gr.next()) {
				query = query.concat(gr.sys_id + ',');
			}
			
		}

		return query;
	},


	// Find the lowest taxonomy layer definition within the Portfolio
	// If portfolio does not exist, ignore the portfolio filter
	getLowestLevelTaxonomy: function(portfolio) {
		if (portfolio == '')
			return null;

		var layer = new GlideRecord('spm_taxonomy_layer_definition');
		layer.addQuery('spm_service_portfolio', portfolio);
		layer.orderByDesc('order');
		layer.setLimit(1);
		layer.query();

		if (layer.next())
			return layer.sys_id;
		else
			return null;
	},

	getTaxonomyLeafOrder: function(portfolioId) {
		var lowestLayer = new GlideRecord('spm_taxonomy_layer_definition');
		lowestLayer.addQuery('spm_service_portfolio', portfolioId);
		lowestLayer.orderByDesc('order');
		lowestLayer.setLimit(1);
		lowestLayer.query();

		var leafOrder = null;
		if (lowestLayer.next())
			leafOrder = lowestLayer.order;
		return leafOrder;
	},

	isPortfolioLayerLocked: function(portfolio) {
		var lowestLevelNodeQuery = this.getLowestLevelTaxonomyNode(portfolio);
		// Iterate over all lowest level nodes and check for children services
		var gr = new GlideRecord('spm_taxonomy_node');
		gr.addEncodedQuery(lowestLevelNodeQuery);
		gr.query();

		while (gr.next()) {
			// If this node has any service return true
			var gr2 = new GlideRecord('cmdb_ci_service');
			gr2.addQuery('spm_taxonomy_node', gr.sys_id);
			gr2.query();

			if (gr2.hasNext())
				return true;
		}

		return false;	
	},

	getParentLayerNodes: function(current) {
		var gr = new GlideRecord('spm_taxonomy_layer_definition');
		gr.orderByDesc('order');
		gr.addQuery('order', '<', current.spm_taxonomy_layer.order);
		gr.addQuery('spm_service_portfolio', current.spm_service_portfolio);
		gr.query();

		if (gr.next())
			return gr.getValue('order'); //Order is mandatory, we can assume this will return a value when queried
		return '';
	},

	getTaxonomyNodeConditionQualifier: function(current, RP){
		var shouldShowNewButton = current.canCreate() && RP.isRelatedList() && !RP.isInDevStudio() && (current.getRecordClassName() == 'cmdb_ci_service' || current.getRecordClassName() == 'cmdb_ci_service_business' || current.getRecordClassName() == 'cmdb_ci_service_technical');
		var uri = gs.action.getGlideURI();
		// Show new button only on taxonomy node page. Hide everywhere else.
		var isTaxonomyNodePage = (uri.toString().includes('spm_taxonomy_node.do'));
		return shouldShowNewButton && isTaxonomyNodePage;
	},

	type: 'SPMRefUtils'
};
