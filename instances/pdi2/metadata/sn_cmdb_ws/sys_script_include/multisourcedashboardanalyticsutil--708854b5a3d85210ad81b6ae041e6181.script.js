var MultisourceDashboardAnalyticsUtil = Class.create();
MultisourceDashboardAnalyticsUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	// TODO: Move all common functionality to this script include
	initialize: function() {

	},

	getPrincipalClasses: function() {
        return this._getClasses(true);
    },

    getNonPrincipalClasses: function() {
        return this._getClasses(false);
    },

    _getClasses: function(principal) {
        var classes = [];
        var gr = new GlideRecordSecure('cmdb_class_info');
        gr.addQuery('principal_class', principal);
        gr.query();
        while(gr.next())
          classes.push(gr.getValue('class'));

        return classes;
    },

    type: 'MultisourceDashboardAnalyticsUtil'
});
