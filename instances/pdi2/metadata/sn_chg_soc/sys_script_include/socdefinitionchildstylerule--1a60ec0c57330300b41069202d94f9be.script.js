var SoCDefinitionChildStyleRule = Class.create();
SoCDefinitionChildStyleRule.prototype = Object.extendsObject(SoCDefinitionChildStyleRuleSNC, {

    type: 'SoCDefinitionChildStyleRule'
});

SoCDefinitionChildStyleRule.findByDefId = SoCDefinitionChildStyleRuleSNC.findByDefId;
SoCDefinitionChildStyleRule.createDefaultRule = SoCDefinitionChildStyleRuleSNC.createDefaultRule;
