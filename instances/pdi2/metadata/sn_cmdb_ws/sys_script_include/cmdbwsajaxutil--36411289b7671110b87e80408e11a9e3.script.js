var CMDBWsAjaxUtil = Class.create();
    CMDBWsAjaxUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getClassDisplayName: function() {
        var response = {};
        var gr = new GlideRecordSecure(this.getParameter("sysparm_datacenter_class"));
        response['className'] = gr.getClassDisplayValue();
        return JSON.stringify(response);
    },

    type: 'CMDBWsAjaxUtil'
});
