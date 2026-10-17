var PortalTaxonomyUtilSNC = Class.create();
PortalTaxonomyUtilSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	/**
	 * Returns the array of service portals associated with given taxonomy.
	 * @input taxonomyId - taxonomyId of taxonomy
	 * return an array of JSON objects of service portal records.
	 */
	getPortals: function () {
		var taxonomyId = this.getParameter('sysparm_taxonomyId');
		if (!taxonomyId) {
			return;
		}
		var gr = new GlideRecord('m2m_sp_portal_taxonomy');
		gr.addQuery('taxonomy', taxonomyId);
		gr.addActiveQuery();
		gr.query();
		var portals = [];
		while (gr.next()) {
			var PortalObj = {
				"id": gr.getValue("sp_portal"),
				"name": GlideStringUtil.escapeHTML(gr.getDisplayValue("sp_portal")),
				"url": gr.sp_portal.url_suffix.toString()
			};
			portals.push(PortalObj);
		}
		return JSON.stringify(portals);
	},
	type: 'PortalTaxonomyUtilSNC'
});
