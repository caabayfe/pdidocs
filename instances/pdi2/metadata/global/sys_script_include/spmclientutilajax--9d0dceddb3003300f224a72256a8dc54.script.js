var SPMClientUtilAjax = Class.create();
SPMClientUtilAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    getLeafOrder: function() {
        var portfolioId = this.getParameter("sysparm_portfolio");
        var layerId = this.getParameter("sysparm_layer");

        var leafOrder = new global.SPMRefUtils().getTaxonomyLeafOrder(portfolioId);

        var layerGr = new GlideRecordSecure("spm_taxonomy_layer_definition");
        layerGr.get(layerId);

        if (layerGr.order == leafOrder)
            return "leaf";
        else
            return "taxonomy";
    },
    hasChildNodes: function() {
        var gr = new GlideRecord('spm_taxonomy_node');
        gr.addQuery('parent', this.getParameter("sysparm_sys_id"));
        gs.info(this.getParameter("sysparm_sys_id"));
        gr.query();

        if (gr.next()) {
            return "taxonomy";
        } else {
            return "leaf";
        }
    },

	hasChildServices: function() {
		var grService = new GlideRecordSecure('cmdb_ci_service');
		grService.addQuery('spm_taxonomy_node', this.getParameter('sysparm_sys_id'));
		grService.setLimit(1);
		grService.query();

		if (grService.hasNext())
			return true;

		return false;
	},

    isRootLayer: function() {
        var portfolioId = this.getParameter("sysparm_portfolio");
        var layerId = this.getParameter("sysparm_layer");

        if (!portfolioId || !layerId)
            return;

        var layerRecord = new GlideRecordSecure('spm_taxonomy_layer_definition');
        layerRecord.addQuery('spm_service_portfolio', portfolioId);
        layerRecord.orderBy('order');
        layerRecord.setLimit(1);
        layerRecord.query();

        if (!layerRecord.next())
            return;

        return layerRecord.sys_id == layerId;
    },

    checkNodeOwnership: function() {
        var sysId = this.getParameter('sysparm_sysId');
        var type = this.getParameter('sysparm_type');
        var allowedToSave = (new global.SPMUtilsFactory().getUtils()).checkNodeOwnership(type, sysId);

        return allowedToSave;
    },

    checkPortfolioOwnership: function() {
        var sysId = this.getParameter('sysparm_sysId');
        var grPortfolio = new GlideRecord('spm_service_portfolio');
        grPortfolio.get(sysId);
        var allowedToSave = (new global.SPMUtilsFactory().getUtils()).checkPortfolioAuthorization(grPortfolio);

        return allowedToSave;
    },

    getParentServiceFieldValues: function() {
        var serviceId = this.getParameter('sysparm_serviceId');
        var serviceGR = new GlideRecordSecure('cmdb_ci_service');
        if (serviceGR.get(serviceId) && serviceGR.canRead()) {
            var results = {
                owned_by: serviceGR.getValue('owned_by'),
                delivery_manager: serviceGR.getValue('delivery_manager'),
                service_owner_delegate: serviceGR.getValue('service_owner_delegate'),
                consumer_type: serviceGR.getValue('consumer_type'),
            };
            return JSON.stringify(results);
        }
    },

    /**
     * Process and call corresponding automation functions based on selections made in the Service/Portfolio Automations modal
     * 
     * @return {string} - String representation of Object with key/value pair representing the number of completed automations
     */
    processModalChoices: function() {
        var spmAutomationUtils = new global.SPMAutomationUtils();
        var portfolioSysId = this.getParameter('sysparm_portfolio');
        var choices = this.getParameter('sysparm_choices');
        var numOfferings = this.getParameter('sysparm_number_of_offerings');
        var completedAutomations = 0;
        var obj = JSON.parse(choices);
        for (var key in obj) {
            var name = obj[key].name;
            var value = obj[key].value;
            // Apply automations based on name and only for the selected checkboxes from modal
            if (value === true) {
                switch (name) {
                    case 'add_offerings_to_services':
                        spmAutomationUtils.createOneManyOfferingsForPortfolio(portfolioSysId, numOfferings);
                        completedAutomations++;
                        break;
                    default:
                        break;
                }
            }
        }
        gs.log(gs.getMessage('Success! Based on your selection, {0} portfolio automation(s) were completed.', [completedAutomations.toString()]));
        var results = {
            completed_automations: completedAutomations
        };
        return JSON.stringify(results);
    },

    type: 'SPMClientUtilAjax'
});
