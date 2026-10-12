var AisDynamicFilter = Class.create();
AisDynamicFilter.prototype = {
    initialize: function() {
    },
	/**
	 *
	 * @param searchContextConfigId     Search application for which the filter should be applied
	 * @param profileId                 Search profile for which the filter should be applied
	 * @param tableName                 Table name for which the filter should be applied
	 * @param additionalContext         Additional Context info that can be used to determine if the filter is applicable
	 * @param preprocess                Indicates if the filter is applied pre-search or post-search
	 *
	 * @return                          true/false to indicate if the filter is applicable
	 */
	isApplicable: function(searchContextConfigId, profileId, tableName, additionalContext, preprocess){},

	/**
	 * Generate filter condition for the given search context. This method will be invoked if the client has returned
	 * true for the isApplicable method with preprocess=true
	 *
	 * @param searchContextConfigId     Search application for which the filter should be applied
	 * @param profileId                 Search profile for which the filter should be applied
	 * @param tableName                 Table name for which the filter should be applied
	 * @param additionalContext         Additional Context info that can be used to determine if the filter is applicable
	 *
	 * @return                          GlideRecord which contains IQuery condition that represents the filter
	 */
	getFilterCondition: function(searchContextConfigId, profileId, tableName, additionalContext){},


	/**
	 * This method will be invoked if the client has returned true for the isApplicable method with preprocess=false
	 * The client can indicate if the given document should be filtered with a true/false
	 *
	 * @param searchContextConfigId     Search application for which the filter should be applied
	 * @param profileId                 Search profile for which the filter should be applied
	 * @param recordClass               Record class for which the filter should be applied
	 * @param sysId                     SysID of the record from the above table
	 * @param additionalContext         Additional Context info that can be used to determine if the filter is applicable
	 *
	 * @return                          true/false to indicate if the document should be filtered or not
	 */
	shouldRemoveDocument(searchContextConfigId, profileId, recordClass, sysId, additionalContext){},
    type: 'AisDynamicFilter'
};
