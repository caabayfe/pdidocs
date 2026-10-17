var ServiceModelConversionBridge = Class.create();
ServiceModelConversionBridge.prototype = {
    initialize: function () {
    },

    /**
     * @param {GlideRecord} serviceGr
     * @returns {Result}
    */
    removeServiceModelArtifacts: function (serviceGr) {
        return { 
            isSuccess: new SNC.ServiceModelingIntegrationManager().removeBusinessService(serviceGr) 
        };
    },

    /**
     * @param {GlideRecord} serviceGr
     * @returns {string|null} layer sys_id
    */
    createServiceModelArtifacts: function (serviceGr) {
        return new SNC.ServiceModelingIntegrationManager().createBusinessService(serviceGr);
    },

    /**
     * @param {string} serviceId
     * @returns {ImpactRules}
     * @throws {Error} if the service model context or model cannot be retrieved
     */
    extractImpactRulesFromServiceModel: function (serviceId) {
        var modelingUtils = SNC.ServiceModelingUtils.initWithDefaultUtil();
        var context = modelingUtils.getContext(serviceId, 'Impact', false, null);
        if (!context) {
            throw new Error('Could not get service model context for service: ' + serviceId);
        }
        var model = context.getModel();
        if (!model) {
            throw new Error('Could not get service model for service: ' + serviceId);
        }

        return {
            globalRuleJsons: this._collectGlobalRuleOverrides(model),
            perCiRuleJsons: this._collectPerCiRuleOverrides(model)
        };
    },

    /**
     * @private
     * @param {object} model
     * @returns {ImpactRuleJson[]}
     */
    _collectGlobalRuleOverrides: function (model) {
        var globalImpactRules = model.globalImpactRules();
        
        /** @type {ImpactRuleJson[]} */
        var globalRules = [];
        
        for (var i = 0; i < globalImpactRules.length; i++) {
            globalRules.push(globalImpactRules[i].getContents());
        }
        return globalRules;
    },

    /**
     * @private
     * @param {object} model
     * @returns {CiAndImpactRule[]}
     */
    _collectPerCiRuleOverrides: function (model) {
        /** @type {CiAndImpactRule[]} */
        var ciAndRulePairs = [];
        var elements = model.elements();
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var ciId = element.getPropertyBag().getCiSysId();
            var rules = element.impactRuleDefinitions();
            for (var j = 0; j < rules.length; j++) {
                ciAndRulePairs.push({ ciId: ciId, ruleJson: rules[j].getContents() });
            }
        }
        return ciAndRulePairs;
    },

    /**
     * @param {string} bsId
     * @param {string|null} ciId
     * @returns {ImpactRuleJson[]}
     */
    getImpactRule: function (bsId, ciId) {
        var javaList = new SNC.ImpactManager().getImpactRule(bsId, ciId);
        /** @type {ImpactRuleJson[]} */
        var result = [];
        for (var i = 0; i < javaList.size(); i++) {
            result.push(javaList.get(i).toJson());
        }
        return result;
    },

    /**
     * @param {string} bsId
     * @param {string|null} ciId
     * @param {ImpactRuleJson}
     * @returns {Result}
     */
    setImpactRule: function (bsId, ciId, ruleJson) {
        return {
            isSuccess: new SNC.ImpactManager().setImpactRule(bsId, ciId, ruleJson)
        };
    },

    /**
     * @param {string} bsId - service sys_id
     * @returns {Result}
     */
    migrateCustomImpactRulesToServiceModel: function (bsId) {
        return {
            isSuccess: new SNC.ImpactManager().migrateCustomImpactRulesToServiceModel(bsId)
        };
    },

    /**
     * @param {string} bsId
     */
    deleteLightweightImpactRulesOfService: function (bsId) {
        var impactRuleGr = new GlideRecord('em_impact_rule');
        impactRuleGr.addQuery('business_service', bsId);
        impactRuleGr.deleteMultiple();
    },

    type: 'ServiceModelConversionBridge'
};

/**
 * @typedef {object} Result
 * @property {boolean} isSuccess
 */

/**
 * @typedef {object} ImpactRules
 * @property {string[]} globalRuleJsons
 * @property {{ ciId: string, ruleJson: string }[]} perCiRuleJsons
 */

/**
 * @typedef {string} ImpactRuleJson - JSON string representing the `ImpactRuleJsonObject` structure
 *
 * @typedef {object} ImpactRuleJsonObject
 * @property {string} name
 * @property {string} ruleSysId
 * @property {string} ciType
 * @property {('CI'|'CLUSTER'|'HOST'|'NETWORK_PATH'|'STORAGE_PATH'|'CONTAINMENT'|'INCLUSION')} ruleType
 * @property {boolean} global
 * @property {('parent'|'business_service')} impactOn
 * @property {string} influence
 * @property {boolean} isPercentage
 * @property {[number, number, number, number]} severities
 * @property {string} [impactRuleDefinition]
*/

/**
 * @typedef {{ ciId: string, ruleJson: ImpactRuleJson }} CiAndImpactRule
 */
 
