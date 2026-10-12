var SPMTaxonomyUtilsSNC = Class.create();
SPMTaxonomyUtilsSNC.prototype = {
    initialize: function() {
        this.CONSTANTS = new SPMFoundationConstants();
        this.LOGGER = new GSLog("com.snc.service_portfolio.log", "SPMTaxonomyUtilsSNC");
    },

    /**
     * External method to migrate service portfolio for direct child nodes or child services
     * @param {String} portfolioId
     * @param {String} nodeId 
     */
    migratePortfolio: function(portfolioId, nodeId) {
        try {
            this.LOGGER.debug('SPMTaxonomyUtilsSNC: migratePortfolio(): start');
            // check if standard portfolio is active, otherwise do not migrate
            if (!gs.getProperty(this.CONSTANTS.STANDARD_PORTFOLIO_CONSTRUCT_PROPERTY, false))
                return;
            
            this._migrateDirectChildren(portfolioId, nodeId);
        } catch (e) {
            this.LOGGER.error('SPMTaxonomyUtilsSNC: migratePortfolio(): error: ' + e.toString());
        } finally {
            this.LOGGER.debug('SPMTaxonomyUtilsSNC: migratePortfolio(): end');
        }
    },

	/**
     * External method to re-parent children services from parentNode to currentNode
     * @param {String} currentNode
     * @param {String} parentNode 
     */
	reparentNodeServices: function(currentNode, parentNode) {
		try {
			this.LOGGER.debug('SPMTaxonomyUtilsSNC: reparentNodeServices(): start');
			var totalServiceCount = 0;
			var updatedServiceCount = 0;

			if (!parentNode)
				return;
			if (!gs.getProperty(this.CONSTANTS.STANDARD_PORTFOLIO_CONSTRUCT_PROPERTY, false))
				return;
			
			// Check if current node has any children taxonomy nodes, escape if it does
			var grNode = new GlideRecordSecure(this.CONSTANTS.TAXONOMY_TABLE);
			grNode.addQuery('parent', currentNode);
			grNode.setLimit(1);
			grNode.query();

			if (grNode.hasNext())
				return;

			var grService = new GlideRecordSecure(this.CONSTANTS.SERVICE_TABLE);
			grService.addQuery(this.CONSTANTS.TAXONOMY_TABLE, parentNode);
			grService.query();
			totalServiceCount = grService.getRowCount();

			// Re-assign parentNode services to currentNode
			while(grService.next()) {
				grService.setValue(this.CONSTANTS.TAXONOMY_TABLE, currentNode);
				
				if (grService.update())
					updatedServiceCount++;
				else
					this.LOGGER.error('SPMTaxonomyUtilsSNC: reparentNodeServices(): unable to reparent service: '
				+ grService.getUniqueValue() + 'to taxonomy node' + currentNode);
			}

			if (totalServiceCount > 0)
				gs.addInfoMessage(gs.getMessage("{0} of {1} services were successfully reparented.", [updatedServiceCount.toString(), totalServiceCount]));
			
			return;
		}

		catch (e) {
            this.LOGGER.error('SPMTaxonomyUtilsSNC: reparentNodeServices(): error: ' + e.toString());
        } finally {
            this.LOGGER.debug('SPMTaxonomyUtilsSNC: reparentNodeServices(): end');
        }
	},

    /**
     * Migrate direct child nodes (or child services) to a different service portfolio 
     * 
     * If "Migrate Service Portfolio" business rule on spm_taxonomy_node is active
     * then this triggers a recursion that will traverse all subsequent child nodes and services
     * 
     * @param {String} portfolioId
     * @param {String} nodeId 
     */
    _migrateDirectChildren: function(portfolioId, nodeId) {
        this.LOGGER.debug('SPMTaxonomyUtilsSNC: _migrateDirectChildren(): start');

        // if node has children, update the child nodes
        var childNode = new GlideRecord(this.CONSTANTS.TAXONOMY_TABLE);
        childNode.addQuery('parent', nodeId);
        childNode.query();
        while (childNode.next()) {
            childNode.setValue('spm_service_portfolio', portfolioId);
            if (!childNode.update())
                this.LOGGER.error('SPMTaxonomyUtilsSNC: _migrateDirectChildren(): unable to migrate portfolio sys_id: '
                    + portfolioId + ' for taxonomy node sys_id: ' + childNode.getUniqueValue());
        }

        // if node is a leaf, update the child services
        if (childNode.getRowCount() == 0)
            this._migrateServices(portfolioId, nodeId);

        this.LOGGER.debug('SPMTaxonomyUtilsSNC: _migrateDirectChildren(): end');
    },

    /**
     * Migrate services of a leaf taxonomy node to a different service portfolio 
     * @param {String} portfolioId 
     * @param {String} nodeId 
     */
    _migrateServices: function(portfolioId, nodeId) {
        this.LOGGER.debug('SPMTaxonomyUtilsSNC: _migrateServices(): start');

        var childService = new GlideRecord(this.CONSTANTS.SERVICE_TABLE);
        childService.addQuery('spm_taxonomy_node', nodeId);
        childService.query();
        while (childService.next()) {
            childService.setValue('spm_service_portfolio', portfolioId);
            if (!childService.update())
                this.LOGGER.logErr('SPMTaxonomyUtilsSNC: _migrateServices(): failed to migrate portfolio sys_id: '
                    + portfolioId + ' for service sys_id: ' + childService.getUniqueValue());
        }

        this.LOGGER.debug('SPMTaxonomyUtilsSNC: _migrateServices(): end');
    },

    type: 'SPMTaxonomyUtilsSNC'
};
