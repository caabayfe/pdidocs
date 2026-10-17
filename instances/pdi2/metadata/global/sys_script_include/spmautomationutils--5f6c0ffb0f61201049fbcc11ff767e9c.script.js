var SPMAutomationUtils = Class.create();
SPMAutomationUtils.prototype = {
    initialize: function() {
        this.spmFoundationConstants = new global.SPMFoundationConstants();
        this.spmRefUtils = new global.SPMRefUtils();
        this.totalNumOfferingsCreated = 0;
    },

    /**
     * Create one-many offerings for each service in a portfolio
     *
     * @param {string} portfolioSysId - sys_id of the spm_service_portfolio record
     * @param {string} numOfferings - number of offerings to create per service in the portfolio
     */
    createOneManyOfferingsForPortfolio: function(portfolioSysId, numOfferings) {
        gs.addInfoMessage(gs.getMessage('Service offerings are being created for all services in this portfolio with no child offerings. This may take a few minutes.'));

        var services = new GlideRecord(this.spmFoundationConstants.SERVICE_TABLE);
        services.addQuery(this.spmFoundationConstants.PORTFOLIO_TABLE, portfolioSysId);
        services.addNotNullQuery(this.spmFoundationConstants.TAXONOMY_TABLE);
        services.query();

        // Traverse each service
        while (services.next()) {
            this.createOneManyOfferings(services, numOfferings);
        }

        if (this.totalNumOfferingsCreated == 0)
            gs.addInfoMessage(gs.getMessage('All services in this portfolio already contain child offerings.'));

        return this.totalNumOfferingsCreated;
    },

    /**
     * Create one-many offerings for a service
     *
     * @param {GlideRecord} service - cmdb_ci_service that will be the parent of the created service_offering records
     * @param {string} numOfferings - number of offerings to create for the service
     */
    createOneManyOfferings: function(service, numOfferings) {
        var portfolio = service.spm_service_portfolio;
        var serviceName = service.getValue(this.spmFoundationConstants.NAME);
        var offeringsToCreate = (numOfferings === undefined) ? offeringsToCreate = portfolio.offerings_per_service : offeringsToCreate = numOfferings;
        var offeringsCreated = 0;

        var offerings = new GlideRecord(this.spmFoundationConstants.SERVICE_OFFERING_TABLE);
        offerings.addQuery(this.spmFoundationConstants.PARENT, service.sys_id);
        offerings.query();

        // Only create offerings if service does not already have child offerings
        if (!offerings.hasNext()) {
            var serviceOffering = new GlideRecord(this.spmFoundationConstants.SERVICE_OFFERING_TABLE);

            for (var i = 1; i <= offeringsToCreate; i++) {
                serviceOffering.initialize();
                serviceOffering.setValue(this.spmFoundationConstants.PARENT, service.sys_id);
                serviceOffering.setValue(this.spmFoundationConstants.BUSINESS_CRITICALITY, service.busines_criticality);
                serviceOffering.setValue(this.spmFoundationConstants.OWNED_BY, service.owned_by);
                serviceOffering.setValue(this.spmFoundationConstants.DELIVERY_MANAGER, service.delivery_manager);
                serviceOffering.setValue(this.spmFoundationConstants.DELEGATE, service.service_owner_delegate);

                var offeringName;
                if (parseInt(numOfferings) === 1)
                    offeringName = gs.getMessage('{0} Offering', [serviceName]);
                else
                    offeringName = gs.getMessage('{0} Offering {1}', [serviceName, i.toString()]);

                serviceOffering.setValue(this.spmFoundationConstants.NAME, offeringName);
                serviceOffering.insert();
                offeringsCreated++;
                this.totalNumOfferingsCreated++;
            }
            if (offeringsCreated > 0)
                gs.log(gs.getMessage('According to the portfolio configuration, {0} child offering(s) were created for {1}.', [offeringsCreated.toString(), serviceName]));
        }
    },
    type: 'SPMAutomationUtils'
};
