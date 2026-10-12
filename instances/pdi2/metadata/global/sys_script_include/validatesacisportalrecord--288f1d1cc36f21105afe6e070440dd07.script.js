var ValidateSACIsPortalRecord = Class.create();
ValidateSACIsPortalRecord.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'ValidateSACIsPortalRecord',
    validateSACIsPortalRecord: function() {
        var searchContext = this.getParameter('sysparm_search_context');
        var gr = new GlideRecord('sp_portal');
        gr.addQuery('enable_ais', '=', 'true');
        gr.addQuery('search_application', '=', searchContext);
        gr.query();
        return gr.next();
    },


});
