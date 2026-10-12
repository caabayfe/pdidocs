var GetSearchApplicationByPortalSNC = Class.create();
GetSearchApplicationByPortalSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getSearchApplication: function() {
        var portalSysId = this.sanitizeId(this.getParameter('portalSysId'));

        var searchAppSysId = '';

        var gr = new GlideRecord('sp_portal');
        gr.addQuery('sys_id', portalSysId);
        gr.query();


        if (gr.next() && gr.canRead()) {
            searchAppSysId = gr.getValue('search_application');
        }

        return searchAppSysId;
    },

    sanitizeId: function(id) {
        var val = String(id || '');
        var VALID_SYS_ID_REGEX = /^[0-9a-f]{32}$/;
        return val.length === 32 && VALID_SYS_ID_REGEX.test(val) ? val : '-1';
    },

    type: 'GetSearchApplicationByPortalSNC'
});
