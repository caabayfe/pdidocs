var FavoritesAjax = Class.create();
FavoritesAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	/**
     * Returns true if there exists another active favorite content config record with same favorite content type and table values
     * returns {Boolean}
     */
	isDuplicateRecord : function() {
    var table = this.getParameter('sysparm_table');
    var contentType = this.getParameter('sysparm_content_type');
    var sysId = this.getParameter('sysparm_current_sys_id');
    var gr = new GlideRecord('sn_ex_sp_favorite_content_config');
    if (gr.canRead()) {
        gr.addActiveQuery();
        gr.addQuery('table', table);
        gr.addQuery('favorite_content_type', contentType);
        gr.query();
        return gr.next() && gr.getUniqueValue() != sysId;
    }
		return null;
	},
	
    type: 'FavoritesAjax'
});
