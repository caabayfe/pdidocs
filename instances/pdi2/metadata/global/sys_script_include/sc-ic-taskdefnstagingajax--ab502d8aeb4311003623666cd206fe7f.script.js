var sc_ic_TaskDefnStagingAJAX = Class.create();
sc_ic_TaskDefnStagingAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getNextOrderNumber : function() {
		var itemStagingSysId = this.getParameter("sysparm_sc_ic_item_staging");
		if (GlideStringUtil.isEligibleSysID(itemStagingSysId)) {
            var gr = new GlideRecord('sc_ic_item_staging');
            if (gr.get(itemStagingSysId) && gr.canRead())
                return sc_ic_Factory.getWrapperClass(sc_ic.TASK_DEFN_STAGING).getNextOrderNumber(itemStagingSysId);
		}
	},

	isPublic: function() {
		return false;
	},

    type: 'sc_ic_TaskDefnStagingAJAX'
});
