var CategoryUtil = Class.create();
CategoryUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getCatalog: function() {
        if (GlideStringUtil.isEligibleSysID(this.getParameter('sysparm_category_sysid'))) {
            var gr = new GlideRecord("sc_category");
            if (gr.get(this.getParameter('sysparm_category_sysid')) && gr.canRead() && gr.getElement('sc_catalog').canRead())
				return gr.getValue('sc_catalog');
        }
        return '';
    },

    type: 'CategoryUtil'
});
