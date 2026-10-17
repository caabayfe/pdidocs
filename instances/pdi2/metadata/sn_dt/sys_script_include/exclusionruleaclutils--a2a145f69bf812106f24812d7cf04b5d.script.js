var ExclusionRuleACLUtils = Class.create();

ExclusionRuleACLUtils.OOB_EXCLUSION_RULES = {
	'46a811287f44521023e73a96cc8665bf': true,
	'ea372ca87f80521023e73a96cc866559': true,
	'bfa67a417f30121023e73a96cc866567': true,
	'1652aa88ff461210dc00ffffffffffa4': true,
	'd66262c8ff461210dc00ffffffffff70': true,
	'f0426a88ff461210dc00ffffffffff23': true,
	'f47222c8ff461210dc00ffffffffffe1': true,
	'fbf1a688ff461210dc00ffffffffffb0': true,
};

ExclusionRuleACLUtils.prototype = {
    initialize: function() {
    },

	isOutOfBoxRule: function (sysId) {
		return ExclusionRuleACLUtils.OOB_EXCLUSION_RULES[sysId] || false;
	},

    type: 'ExclusionRuleACLUtils'
};
