var SNCCatalogWizardUtil = Class.create();
SNCCatalogWizardUtil.prototype = {
    initialize: function() {},

    getProducerRefQualByWizardType: function(type) {

        if (type == 'crp')
            return 'sys_class_name=sc_cat_item_composite_producer';
        else if (type == 'rp')
            return 'sys_class_name=sc_cat_item_producer';

        return 'sys_class_name=';

    },

	getMRVSVariableSetsForWizardQuestion: function(wizardQuestionGr) {
        var wizard = this._getWizardFromWizardQuestion(wizardQuestionGr);

        if (!wizard || !wizard.type || wizard.type == 'custom' || !wizard.producer)
            return 'sys_id=';

		var catalogItem = new sn_sc.CatItem(wizard.producer);
        var mrvsVars = catalogItem.getMRVSIds();
        return 'sys_idIN' + mrvsVars.join();
    },

    getFlatQuestionsForWizardQuestion: function(wizardQuestionGr) {
        var wizard = this._getWizardFromWizardQuestion(wizardQuestionGr);

        if (!wizard || !wizard.type || wizard.type == 'custom' || !wizard.producer)
            return 'sys_id=';

        var ans = [];
        var catalogItem = new sn_sc.CatItem(wizard.producer);
        var vars = catalogItem.getVariables(false, true, false);
        for (var i = 0; i < vars.length; i++) {
            ans.push(vars[i].id);
        }

        return 'sys_idIN' + ans.join();
    },

    _getWizardFromWizardQuestion: function(wizardQuestionGr) {
        var wizard;

        try {
            wizard = wizardQuestionGr.wizard_section.wizard_step.wizard;
        } catch (e) {
            gs.debug("Error while fetching wizard for Wizard Question:" + wizardQuestionGr.getUniqueValue());
        }

        return wizard;
    },

	getCatItemFromWizardQuestion : function(wizardQuestionGr) {
		var wizardSysID = this._getWizardFromWizardQuestion(wizardQuestionGr);
		if (JSUtil.nil(wizardSysID))
			return null;
		//TODO: Use cache in future
		var wizard = new GlideRecord('sc_wizard');
		return wizard.get(wizardSysID) ? wizard.getValue('producer') : null;
	},

    populateCanEdit: function() {
        if (!current.cat_item.getValue())
            return;

        var g1 = new GlideRecord('item_option_new');
        g1.addActiveQuery();
        g1.addQuery('cat_item', current.cat_item);
		g1.orderBy('question_text');
        g1.query();
        while (g1.next()) {
            if (!g1.attributes.includes('private=true')) //removing private helper variables
                answer.add(g1.sys_id, g1.question_text.getDisplayValue());
        }
        var g2 = new GlideRecord('io_set_item');
        g2.addQuery('sc_cat_item', current.cat_item);
        g2.addNotNullQuery('variable_set');
        g2.addQuery('variable_set.type', 'one_to_many');
		g2.orderBy('variable_set.title');
        g2.query();
        while (g2.next()) {
            if (!g2.variable_set.set_attributes.includes('private=true')) //removing private helper variable sets
                answer.add(g2.variable_set.sys_id, g2.variable_set.title.getDisplayValue());
        }
    },

    populateTemplateMandatory: function() {
        if (!current.cat_item.getValue())
            return;

        var g1 = new GlideRecord('item_option_new');
        g1.addActiveQuery();
        g1.addQuery('cat_item', current.cat_item);
        g1.addQuery('sys_id', 'IN', current.variables.sysparm_template_canedit);
		g1.orderBy('question_text');
        g1.query();
        while (g1.next()) {
			if (!g1.attributes.includes('private=true'))
				answer.add(g1.sys_id, g1.question_text.getDisplayValue());
		}

        var g2 = new GlideRecord('io_set_item');
        g2.addNotNullQuery();
        g2.addQuery('sc_cat_item', current.cat_item);
        g2.addQuery('variable_set', 'IN', current.variables.sysparm_template_canedit);
		g2.orderBy('variable_set.title');
        g2.query();
        while (g2.next()) {
			if (!g2.variable_set.set_attributes.includes('private=true'))
				answer.add(g2.variable_set.sys_id, g2.variable_set.title.getDisplayValue());
		}

    },

    populateTemplateRestricted: function() {
        var g1 = new GlideRecord('item_option_new');
        g1.addActiveQuery();
        g1.addQuery('cat_item', current.cat_item);
        g1.addQuery('sys_id', 'IN', current.variables.sysparm_template_canedit);
        g1.addQuery('type', 21); // Allowed only for List Collector questions
		g1.orderBy('question_text');
        g1.query();
        while (g1.next()) {
			if (!g1.attributes.includes('private=true'))
				answer.add(g1.sys_id, g1.question_text.getDisplayValue());
        }
    },
	
	canDeleteWizardFeedbackPanel: function(feedbackSysId) {
		var wizardGr = new GlideRecord('sc_wizard_step');
		wizardGr.addQuery("feedback", feedbackSysId);
		wizardGr.query();
		while (wizardGr.next()) {
			if (!wizardGr.canDelete())
				return false;
		}
		return true;
	},
	
    type: 'SNCCatalogWizardUtil'
};
