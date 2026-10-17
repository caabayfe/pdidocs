class StudioUtils {
	static type = 'StudioUtils';
	static STUDIO_HOMEPAGE = '/sn_glider_app/servicenow_studio.do';
	/**
	 * Returns AppDetails Page URL
	 * @param {String} appSysID
	 * @returns {String}
	 */
	static getAppDetailsPageURL(appSysID) {
		const gr = new GlideRecord('sys_scope');
		let className = '';
		if (gr.get(appSysID)) className = gr.getValue('sys_class_name');
		else throw 'Please provide valid application sysId.';
		return `/sn_glider_app/servicenow_studio.do?table=${className}&sysId=${appSysID}`;
	}
}
