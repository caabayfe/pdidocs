var VASearchCardCreatorVancouver = Class.create();
VASearchCardCreatorVancouver.prototype = Object.extendsObject(global.VAGeniusCardCreatorTokyo, {

	resultType:null,
	vaContext:null,
	index:0,

	initialize: function(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, type, index, dynamicChoiceNodeName) {

		global.VAGeniusCardCreatorTokyo.prototype.initialize.call(
			this,searchMetadata, searchResults, vaSystem, vaInputs, vaVars, type, index, dynamicChoiceNodeName);

		this.vaContext = vaContext;
		this.resultType = resultType;
		this.index = index;
	},

	getOriginalURL : function() {
		// if we didn't set url previously, generate it here
		if (gs.nil(this.originalURL))
			this.originalURL = global.VAAISearchHelperTokyo.createURLByActionPayload(this.getTableName(), this.getSysId(), this.getActionName(), this.VA_SYSTEM, false, this.DYNAMIC_CHOICE_NODE_NAME);
		
		return this.originalURL;
	},

	/**
	 * Returns the click metrics URL for the given search type.
	 */
	getMetricsURL: function() {

		var originalURL = this.getOriginalURL();

		return global.VAAISearchClickMetricsURLHelper.createResultEventMetricsURL(
			this.resultType, this.SEARCH_META_DATA, this.GENIUS_RESULTS, this.VA_SYSTEM, 
				this.VA_INPUTS, this.VA_VARS, originalURL, this.index);
	},

	/**
	 * Creats card and feedback if required
	 * @Overriden
	 */
	createCard: function() {
		this.preProcess();
		var startTime = new GlideDateTime().getNumericValue();
		this.getTranslations();
		this.createEVAMFields();
		this.LOGGER.debug('{0}: Generating card: type={1}, data={2}',
			this.type, this.TYPE, JSON.stringify(this.CARD_DATA));
		
		// Check to see if  user feedback is enabled.
		var showUserFeedback = global.VAAISearchFeedbackHelper.needUserFeedback(this.VA_SYSTEM, this.VA_INPUTS, this.VA_VARS);

		if (showUserFeedback) {

			var s1 = new GlideDateTime().getNumericValue();
			// if feedback is required, get the feedback data
			var additionalFeedbackData = 
				global.VAAISearchFeedbackHelper.createUserFeedbackPayload(
					this.resultType, this.SEARCH_META_DATA, this.GENIUS_RESULTS, this.VA_SYSTEM, this.VA_INPUTS, this.VA_VARS, this.index);
			var e1 = new GlideDateTime().getNumericValue();
			this.LOGGER.debug("Total time taken to get additional feedback data: {0}", (e1 - s1).toString());

			// if feedback is required, render the card with feedback		
			var cardWithFeedback = this.VA_SYSTEM.renderCardWithFeedback(this.TYPE, JSON.stringify(this.CARD_DATA), JSON.stringify(additionalFeedbackData));
			var endTime = new GlideDateTime().getNumericValue();
			this.LOGGER.debug("Total time taken for card generation after pre process: {0}", (endTime - startTime).toString());

			return cardWithFeedback;
		}
		
		// if feedback is not required, render the card without feedback.
		return this.VA_SYSTEM.renderCard(this.TYPE, JSON.stringify(this.CARD_DATA));
	},

    type: 'VASearchCardCreatorVancouver'
});
