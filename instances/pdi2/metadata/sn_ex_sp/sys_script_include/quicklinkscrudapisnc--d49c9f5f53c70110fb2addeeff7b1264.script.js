var QuickLinksCrudAPISNC = Class.create();
QuickLinksCrudAPISNC.prototype = {
    initialize: function() {
    },
	
	/**
	 * Creates a quick link. 
	 * @param {Object} options - data about the quick link
	 * @returns {String} - sys id of the quick link
	 */
	createQuickLink: function(options) {
		if (!options && !options.type)
			return null;
		
		if (options.type === 'external') {
			return this._createExternalLink(options);
		} else // implement other types of links
			throw new Error('QuickLinksCrudAPISNC.createQuickLink not implemented for "' + options.type + '" type.');
	},
	
	/**
	 * Edit an external link. 
	 * @param {Object} options - data about the external link
	 * @returns {String} - sys id of the updated record
	 */
	editQuickLink: function(options) {
		if (!options && !options.type)
			return null;
		
		if (options.type === 'external') {
			return this._editExternalLink(options);
		} else 
			throw new Error('QuickLinksCrudAPISNC.editQuickLink not implemented for "' + options.type + '" type.');
	},
	
	/**
	 * Delete a quick link. 
	 * @param {Object} options - data about the quick link
	 * @returns {Boolean} - true if successful
	 */
	deleteQuickLink: function(options) {
		if (!options && !options.type)
			return false;
		
		if (options.type === 'external') {
			return this._deleteExternalLink(options);
		} else 
			throw new Error('QuickLinksCrudAPISNC.deleteQuickLink not implemented for "' + options.type + '" type.');
	},
	
	/**
	 * Creates a external link. 
	 * @param {Object} options - data about the quick link
	 * @returns {String} - sys id of the quick link
	 */
	_createExternalLink: function(options) {
		if (!options.title && !options.url && !options.type)
			return null;
		
		var grExLink;
		grExLink = new GlideRecord('sn_ex_sp_external_link');
		if (!grExLink.canCreate())
			return null; 

		grExLink.setValue('title', options.title);
		grExLink.setValue('url', options.url);
		var exLinkSysId = grExLink.insert();
		
		if (!exLinkSysId)
			return null;
		
		var grQuickLink = new GlideRecord('sn_ex_sp_quick_link');
		if (!grQuickLink.canCreate()) 
			return null;
		
		grQuickLink.setValue('name', options.title);
		grQuickLink.setValue('content_type', 'external_link');
		grQuickLink.setValue('title', options.title);
		grQuickLink.setValue('external_link', exLinkSysId);
		return grQuickLink.insert();
	},
	
	/**
	 * Edit an external link. 
	 * @param {Object} options - data about the external link
	 * @returns {String} - sys id of the updated record
	 */
	_editExternalLink: function(options){
		if (!options.recordSysId && (!options.title || !options.url))
			return null;
		
		var grExternalLink = this._getExternalLinkFromQuickLink(options.recordSysId);
		
		if (!grExternalLink || !grExternalLink.canWrite())
			return false;
		
		grExternalLink.setValue('title', options.title);
		grExternalLink.setValue('url', options.url);
		return grExternalLink.update();
	},
	
	/**
	 * Delete an external link. 
	 * @param {Object} options - e.g record sys id 
	 * @returns {Boolean} - true if successful
	 */
	_deleteExternalLink: function(options) {
		if (!options.recordSysId)
			return false;
		
		var grExternalLink = this._getExternalLinkFromQuickLink(options.recordSysId);
		
		if (!grExternalLink || !grExternalLink.canDelete())
			return false;
		
		return grExternalLink.deleteRecord();
	},
	
	/**
	 * Returns a external link glide record from a quick link sysId 
	 * @param {Object} quickLinkSysId - quick link sys id 
	 * @returns {GlideRecord} - sn_ex_sp_external_link glide record
	 */
	_getExternalLinkFromQuickLink: function(quickLinkSysId) {
		var grQuickLinks = new GlideRecord('sn_ex_sp_quick_link');
		
		if (!grQuickLinks.get(quickLinkSysId) || !grQuickLinks.canRead())
			return null;
		
		var externalLinkSysId = grQuickLinks.getValue('external_link');
		if (!externalLinkSysId)
			return null;
		
		var grExternalLink = new GlideRecord('sn_ex_sp_external_link');
		if (!grExternalLink.get(externalLinkSysId))
			return null;
		
		return grExternalLink;
	},

    type: 'QuickLinksCrudAPISNC'
};
