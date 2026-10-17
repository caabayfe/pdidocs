var hermesSysServiceRefQual = Class.create();
hermesSysServiceRefQual.prototype = {
    initialize: function() {},

    getRefQual: function() {
        var gr = new GlideRecordSecure('sys_service');
        gr.addJoinQuery("hermes_app_services");
        gr.query();
        var refServices = [];
        while (gr.next()) {
            refServices.push(gr.getUniqueValue());
        }
        return 'sys_idIN' + refServices;

    },

    type: 'hermesSysServiceRefQual'
};
