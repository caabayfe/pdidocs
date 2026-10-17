var AutoResolutionAISearchResultLineItem = Class.create();

// Feedback types
AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_POSITIVE = 'helpful';
AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_NEGATIVE = 'not_helpful';

// Feedback provider persona types
AutoResolutionAISearchResultLineItem.FEEDBACK_PROVIDER_PERSONA_REQUESTER = "requester";
AutoResolutionAISearchResultLineItem.FEEDBACK_PROVIDER_PERSONA_TASK_ASSIGNEE = "task_assignee";

AutoResolutionAISearchResultLineItem.prototype = {

    // the mapped record
    record: null,

    initialize: function(param) {

        if (typeof param === 'string') {
            // if the param is string, it's the sysId of the record
            this.record = new GlideRecord(global.AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
            if (!this.record.get(param))
                throw 'Record not found';

        } else if (param instanceof GlideRecord) {
            // if the param is GlideRecord instance, it's the record. no need to lookup.
            this.record = param;
        }
    },

    /**
     * after the record is updated from outside, the object needs to be refreshed.
     */
    refresh: function() {
        this.initialize(this.record.getUniqueValue());
    },

    /**
     * Returns the sysId
     */
    getSysId: function() {
        return this.record.getValue('sys_id');
    },

    /**
     * Returns the AI Search reference. It's the parent record.
     */
    getAISearchResultId: function() {
        return this.record.getValue('ai_search_result');
    },

    /**
     * Returns the index of this item. Starting from 0.
     */
    getItemIndex: function() {
        return this.record.getValue('item_index');
    },

    /**
     * Returns the url for the link.
     */
    getClickURL: function() {
        return this.record.getValue('click_url');
    },

    /**
     * Returns the result_type. It should be either 'positive' or 'negative'
     */
    getResultType: function() {
        return this.record.getValue('result_type');
    },

    /**
     * Returns the feedback type set by user.
     */
    getFeedbackType: function() {
        return this.record.getValue('feedback_type');
    },

    /**
     * Returns the feedback value.
     * If feedback_type is positive, the value will be returned from positive_feedback_value,
     * if negative, the value will be returned from negative_feedback_value
     * null will be returned if feedback type is not set.
     */
    getFeedbackValue: function() {

        var feedbackType = this.getFeedbackType();

        if (this._isPositiveFeedbackType(feedbackType))
            return this.record.getValue('positive_feedback_value');
        else if (this._isNegativeFeedbackType(feedbackType))
            return this.record.getValue('negative_feedback_value');
        else
            return null;
    },

    /**
     * Returns the block of the payload
     */
    getResultPayload: function() {
        return this.record.getValue('result_payload');
    },

    /**
     * Sets the feedback
     * @param feedbackType - either 'positive' or 'negative . This can not be null.
     * @param feedbackValue
     */
    setFeedback: function(feedbackType, feedbackValue) {

        this.record.setValue('feedback_type', feedbackType);

        //pick the right column accordingly based on the feedback type
        if (this._isPositiveFeedbackType(feedbackType)) {
            this.record.setValue('positive_feedback_value', feedbackValue);
            this.record.setValue('negative_feedback_value', ''); // override any existing one.
        } else if (this._isNegativeFeedbackType(feedbackType)) {
            this.record.setValue('negative_feedback_value', feedbackValue);
            this.record.setValue('positive_feedback_value', ''); // override any existing one.
        }
    },

    /**
     * Returns the feedback payload. This payload is for GlideSignals API
     */
    getFeedbackPayload: function() {
        return this.record.getValue('feedback_payload');
    },

    /**
     * After the event fired, mark this column true.
     */
    setFeedbackSent: function() {
        this.record.setValue('feedback_submitted', true);
    },

    /**
     * Tests if the feedback is submitted.
     */
    isFeedbackSubmitted: function() {
        return this.record.getValue('feedback_submitted') == '1';
    },

	/**
     * Sets the result status.
     */
    setResultStatus: function(status) {
        this.record.setValue('result_status', status);
    },

    getResultStatus: function() {
        return this.record.getValue('result_status');
    },

    /**
     * Sets the request table.
     */
    setRequestTable: function(tableName) {
        this.record.setValue('request_table', tableName);
    },

    getRequestTable: function() {
        return this.record.getValue('request_table');
    },

    /**
     * Sets the request sys_id.
     */
    setRequestId: function(requestId) {
        this.record.setValue('request_id', requestId);
    },

    getRequestId: function() {
        return this.record.getValue('request_id');
    },
	
    getResourceTable: function() {
        return this.record.getValue('resource_table');
    },
	
    getResourceId: function() {
        return this.record.getValue('resource_id');
    },

	getKBArticle: function() {
		return this.record.kb_article;
	},
	
	getDescription: function() {
		return this.record.getValue('description');
	},
	
	setFeedbackProvider: function(feedbackProvider) {
		return this.record.setValue('feedback_provider', feedbackProvider);
	},
	
	getFeedbackProvider: function() {
		return this.record.getValue('feedback_provider');
	},
	
	setFeedbackProviderPersona: function(feedbackProviderPersona) {
		return this.record.setValue('feedback_provider_persona', feedbackProviderPersona);
	},
	
	getFeedbackProviderPersona: function() {
		return this.record.getValue('feedback_provider_persona');
	},
	
    update: function() {
        this.record.update();
    },

    _isPositiveFeedbackType: function(feedbackType) {
        return feedbackType == AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_POSITIVE;
    },

    _isNegativeFeedbackType: function(feedbackType) {
        return feedbackType == AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_NEGATIVE;
    },
	
    type: 'AutoResolutionAISearchResultLineItem'
};

/**
 * return link with line item sysId param based on type of recommendation
 * catalog -> referrer param
 * kb article -> recommendation_id param
 * @param lineItem AutoResolutionAISearchResultLineItem
 * @return {string}
 */
AutoResolutionAISearchResultLineItem.getRecommendationURL = function(lineItem) {
    var clickURL = lineItem.getClickURL();
    var sysId = lineItem.getSysId();

    return AutoResolutionAISearchHelper.getIARSearchResultLink(clickURL, sysId);
};

/**
 * Returns the available positive feedback values
 */
AutoResolutionAISearchResultLineItem.getAvailablePositiveFeedbackValues = function() {
    return _getChoiceValues('positive_feedback_value');
};

/**
 * Returns the available negative feedback values
 */
AutoResolutionAISearchResultLineItem.getAvailableNegativeFeedbackValues = function() {
    return _getChoiceValues('negative_feedback_value');
};

/**
 * Returns the available result status
 */
AutoResolutionAISearchResultLineItem.getAvailableResultStatus = function() {
    return _getChoiceValues('result_status');
};

/**
 * Returns the choice value set on the table
 */
_getChoiceValues = function(element) {

    var gr = new GlideRecord('sys_choice');
    gr.addQuery('name', AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
    gr.addQuery('element', element);
    gr.orderBy('sequence');

    gr.query();

    var arr = [];
    while (gr.next()) {
        var result = {};
        result.label = gr.getValue('label');
        result.value = gr.getValue('value');
        result.sequence = gr.getValue('sequence');
        arr.push(result);
    }
    return arr;
};
