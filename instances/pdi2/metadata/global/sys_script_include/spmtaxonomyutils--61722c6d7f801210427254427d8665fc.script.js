var SPMTaxonomyUtils = Class.create();
SPMTaxonomyUtils.prototype = Object.extendsObject(SPMTaxonomyUtilsSNC, {
	initialize: function() {
		SPMTaxonomyUtilsSNC.prototype.initialize.call(this);
	},

    type: 'SPMTaxonomyUtils'
});
