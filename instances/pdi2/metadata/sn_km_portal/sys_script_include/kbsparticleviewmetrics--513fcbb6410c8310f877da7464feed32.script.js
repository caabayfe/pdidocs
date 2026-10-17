var KBSPArticleViewMetrics = Class.create();
KBSPArticleViewMetrics.prototype = {
    initialize: function() {
    },
	getCount: function() {
        var count = 0;
		var SP_PORTAL = '81b75d3147032100ba13a5554ee4902b';
		var KB_VIEW_PAGE = 'a60dcc050be432004ce28ffe15673a54';
        if (GlideTableDescriptor.isValid('sp_log')) {
            var ga = new GlideAggregate('sp_log');
            ga.addEncodedQuery('sys_created_onONThis month@javascript:gs.beginningOfThisMonth()@javascript:gs.endOfThisMonth()');
            ga.addQuery('page', KB_VIEW_PAGE);
            ga.addQuery('portal', SP_PORTAL);
            ga.addAggregate('COUNT');
            ga.query();
            if (ga.next()) {
                count = ga.getAggregate('COUNT');
            }
        }
        return count;
    },

    type: 'KBSPArticleViewMetrics'
};
