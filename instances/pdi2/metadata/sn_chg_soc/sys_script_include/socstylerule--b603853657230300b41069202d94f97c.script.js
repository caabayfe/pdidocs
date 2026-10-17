var SoCStyleRule = Class.create();
SoCStyleRule.prototype = Object.extendsObject(SoCStyleRuleSNC, {

    type: 'SoCStyleRule'
});

SoCStyleRule.findByTableName = SoCStyleRuleSNC.findByTableName;
