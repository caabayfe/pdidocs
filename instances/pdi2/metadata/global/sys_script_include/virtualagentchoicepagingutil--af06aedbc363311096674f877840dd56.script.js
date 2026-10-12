var VirtualAgentChoicePagingUtil = Class.create();
VirtualAgentChoicePagingUtil.prototype = {
    initialize: function(fieldName, table, pageSize, searchColumns, encodedQuery, searchText, vaVars) {
        this.PAGES = "pages";
        this.separator = " - ";
        this.optionsCount = "global_choice_options_count";
        this.totalOptionsCount = 0;
        this.fieldName = fieldName;
        this.pageInfoVarName = "global_choice_paging";
        this.validationVarName = "global_choice_validating";
        this.validationTextVarName = "global_choice_validation_text";
	this.topicFilterInProgressName= "_topic_filter_in_progress";
        this.vaVars = vaVars;
        this.pageInfo = this.getPageInfo(vaVars);
        this.defaultPageSize = gs.getProperty("com.glide.cs.picker_page_limit", 10);
        this.defaultQueryLimit = gs.getProperty("com.glide.cs.picker_query_limit", 10000);
        if (this.pageInfo.searchText != this.pageInfo.lastSearchText)
            this.pageInfo.pages = {};
        if (this.vaVars[this.validationVarName]) {
            this.pageInfo.validation = true;
            this.pageInfo.searchText = this.vaVars[this.validationTextVarName];
        }
	this.topicFilterInProgress = this.vaVars[this.topicFilterInProgressName] || false;
        this.table = table;
        this.pageSize = pageSize && pageSize > 0 ? pageSize :
            this.pageInfo.limit ? this.pageInfo.limit : this.defaultPageSize;
        this.pageInfo.limit = this.pageSize;
        this.searchColumns = searchColumns.split(",");
        this.encodedQuery = encodedQuery;
        this.searchText = searchText ? searchText : this.pageInfo.searchText;
        this.secondaryLabelFunction = [];
    },

    /**
     * Get a GlideRecordSecure for paging.  Does not set the paging window.  Use getSecureOptions method 
     * to page forward
     */
    getPagingGlideRecordSecure: function(orderByColumn, orderDescending, valueCol) {
		if (this.pageInfo.validation && !valueCol) {
			// Validation calls query from getSecureOptions, prevent two queries.
			return null;
		}

        var gr = new GlideRecordSecure(this.table);
        gr.addEncodedQuery(this.encodedQuery);

        if (this.searchText && this.searchColumns.length > 0) { //handle search text, if present
			var searchTexts = this._extractSearchTexts();
			var searchCond = null;
			var textIndex;
			for (textIndex = 0; textIndex < searchTexts.length; textIndex++) {
				searchCond = this._filterSearchText(gr, searchCond, searchTexts[textIndex].trim(), valueCol, textIndex);
			}
        }
        if (orderByColumn) {
            if (orderDescending)
                gr.orderByDesc(orderByColumn);
            else
                gr.orderBy(orderByColumn);
        }
        gr.setLimit(this.defaultQueryLimit);
        gr.query();
		
	if (this.topicFilterInProgress && this.searchText && !gr.getRowCount()) {
		gr = new GlideRecordSecure(this.table);
		gr.setLimit(this.defaultQueryLimit);
		gr.addEncodedQuery(this.encodedQuery);
		gr.query();

		if (orderByColumn) {
	                if (orderDescending)
	                    gr.orderByDesc(orderByColumn);
	                else
	                    gr.orderBy(orderByColumn);
	        }
	}

        //**** IMPORTANT **** Setting this variable so we know how many rows are available for the search in total.
        this.totalOptionsCount = gr.getRowCount();
        this.vaVars[this.optionsCount] = this.totalOptionsCount;
        this.pageInfo.lastSearchText = this.searchText;
        return gr;
    },

    /**
     * gets a list of options for a GlideRecordSecure.  Keeps track of paging with vaVars context variables.
     */
    getSecureOptions: function(gr, startRow, valueCol, labelCols) {
		if (this.pageInfo.validation) {
			gr = this.getPagingGlideRecordSecure('', false, valueCol);
		}
        if (!startRow)
            startRow = this.pageInfo.startRow;
        var location = 0,
            count = 0,
            traversed = 0;
        var options = [];
        var lastPage = this.pageInfo.lastPage ? this.pageInfo.lastPage : 0;
        //Look for the page desired by start row to see if we already have the paging info
        var currPageInfo = this.getPage(startRow);
        if (currPageInfo == null) {
            //we didn't find the page info for the current start row.  See if we have a previous
            //page to fill in the gaps
            currPageInfo = {
                'start': 0,
                'last': 0
            };

            if (startRow == (lastPage + this.pageSize)) {
                //paging forward
                var lastPageInfo = this.getPage(lastPage);
                if (lastPageInfo)
                    currPageInfo.start = lastPageInfo.last + 1;
            }
        }

        var startLocation = 0;
        gr.setLocation(currPageInfo.start);
        var moreRecs = true;
        while (moreRecs && count < this.pageSize) {
            location = gr.getLocation();

            if ((currPageInfo.start == 0) && (traversed < startRow)) {
                moreRecs = gr.next();
                ++traversed;
                continue;
            }

			//if the current user cannot read the columns for the current record,
			//decrement the total options count and move on to the next record
            if (!this.canReadColumns(gr, labelCols, valueCol)) {
                moreRecs = gr.next();
                if (this.totalOptionsCount > 0)
                    --this.totalOptionsCount;
                ++traversed;
                continue;
            }

            if (count == 0) //save the start location
                startLocation = location;


            ++count;
            options.push(this.createOption(gr, valueCol, labelCols));
            moreRecs = gr.next();
            ++traversed;
        }
        this.vaVars[this.optionsCount] = this.totalOptionsCount;
        currPageInfo.start = startLocation;
        currPageInfo.last = location;
        this.pageInfo.lastPage = startRow;
        this.pageInfo[this.PAGES][startRow] = currPageInfo;
        this.savePageInfo();
        return options;
    },

    /**
     * Checks to see if the the label columns and value columns are accessible to the 
	 * current user.
     */
    canReadColumns: function(gr, labelCols, valueCol) {
        //if user doesn't have access to the value column, return false
        if (gr.getValue(valueCol) == null)
            return false;
        //if user doesn't have access to at least one of the label columns, return false
        var count = 0;
        for (var i = 0; i < labelCols.length; ++i) {
            if (gr.getDisplayValue(labelCols[i]) != null)
                ++count; //increment if we can access the column display value
        }
        return count > 0;
    },

    /**
     * Creates an option for dynamic choice list given the GlideRecord, value column, and list of lable columns
     */
    createOption: function(gr, valueCol, labelCols) {
        var option = {
            'label': '',
            'render_style': 'data',
            'secondary_label': []
        };
        option.value = gr.getValue(valueCol);
		
        for (var i = 0; i < labelCols.length; ++i) {
            if (i > 0)
                option.label += this.separator;
            option.label += this.getTranslatedLabel(option.value, labelCols[i], gr.getDisplayValue(labelCols[i])); 
        }
        for (var i = 0; i < this.secondaryLabelFunction.length; i++) {
            var secondaryLabelValue = this.secondaryLabelFunction[i](gr);
            option['secondary_label'].push(secondaryLabelValue);
        }
        return option;
    },

	/**
	 * Method return tranlated label if the detected language is different that user glide session language
	 * and Dynamic Translation is disabled
	 */
	getTranslatedLabel: function(sysId, column, label) {
		var detectedLanguage = this.vaVars.global_runtime_detected_language;
		var requesterSessionLanguage = this.vaVars.global_requester_session_language;
		var isDTEnabled = this.isDynamicTranslationEnabled();
		if (!isDTEnabled && detectedLanguage && requesterSessionLanguage && detectedLanguage == requesterSessionLanguage) {
			var gr = new GlideRecord('sys_translated_text');
			gr.addQuery('documentkey', sysId);
			gr.addQuery('fieldname', column);
			gr.addQuery('language', detectedLanguage);
			gr.query();
			while (gr.next()) {
				var languageLabel =  gr.getValue('value');
				if (languageLabel) {
					label = languageLabel;
				}
			}
		}
		return label;
	},

	isDynamicTranslationEnabled: function() {
		return gs.getProperty('sn_generative_ai.disable_dynamic_translation', 'true') == 'false';
	},

    addSecondaryLabelFunction: function(secondaryLabelFunction) {
        this.secondaryLabelFunction.push(secondaryLabelFunction);
    },

    /**
     * Save the paging information json to the conversation context as a string
     */
    savePageInfo: function() {
        this.vaVars[this.pageInfoVarName] = JSON.stringify(this.pageInfo);
    },

    /**
     * Gets saved paging info for the page (startRow)
     */
    getPage: function(page) {
        var pages = this.pageInfo[this.PAGES];
        return pages[page];
    },

    /**
     * gets the paging info json object from the conversation context or creates it if it does not exist
     */
    getPageInfo: function() {
        var pageInfo = !gs.nil(this.vaVars[this.pageInfoVarName]) ? JSON.parse(this.vaVars[this.pageInfoVarName]) : null;
        if (!pageInfo)
            pageInfo = this.getEmptyPageInfo();
        return pageInfo;
    },

    /**
     * creates an empty paging info json object
     */
    getEmptyPageInfo: function() {
        return {
            'pages': {},
            'lastPage': null,
            'searchText': "",
            'lastSearchText': "",
            'startRow': 0,
            'limit': this.defaultPageSize
        };
    },

    /**
     * convenience method for retrieving the selected options from conversation context and 
     * parsing the json.
     */
    getSavedSelectedOptions: function(savedName, vaSystem) {
        var savedOptions = vaSystem.getSavedSelectedOptions(savedName);
        if (savedOptions) {
            savedOptions = JSON.parse(savedOptions);
            return savedOptions.selectedOptions ? savedOptions.selectedOptions : [];
        }
        return [];
    },

	_extractSearchTexts: function() {
		if (!this.searchText) {
			return [];
		}
		var searchTexts;
		try { // attempt to parse array
			searchTexts = JSON.parse(this.searchText);
			if (!Array.isArray(searchTexts)) {
				searchTexts = null;
			}
		} catch(e) {
			// not an array
			searchTexts = null;
		}
		if (!searchTexts) {
			searchTexts = this.searchText.split(',');
		}
		var self = this;
		return searchTexts
			.map(function(searchText) {
				return self._sanitizeSearchText(searchText);
			})
			.filter(function(searchText) {
				return self._isSafeSearchText(searchText);
			});
	},

	_isSafeSearchText: function(searchText) {
		return typeof searchText === 'string' && !!searchText.trim();
	},

	/**
	 * Strips encoded-query control sequences (e.g. "^", "^OR", "^NQ") and any "javascript:"
	 * prefix from search text so only safe, parameterized query values are used downstream.
	 */
	_sanitizeSearchText: function(searchText) {
		if (typeof searchText !== 'string') {
			return searchText;
		}
		var sanitized = searchText.replace(/\^/g, '');
		sanitized = sanitized.replace(/javascript:/gi, '');
		return sanitized.trim();
	},

	_filterSearchText: function(gr, cond, searchText, valueCol, textIndex) {
		if (!searchText) return cond;
		var columnIndex;
		if (!this.pageInfo.validation) {
			for (columnIndex = 0; columnIndex < this.searchColumns.length; ++columnIndex) {
				cond = cond ? cond.addOrCondition(this.searchColumns[columnIndex], 'CONTAINS', searchText) :
					gr.addQuery(this.searchColumns[columnIndex], 'CONTAINS', searchText);
            }
		} else if (valueCol) {
			cond = cond ? cond.addOrCondition(valueCol, '=', searchText) :
				gr.addQuery(valueCol, '=', searchText);
		}
		return cond;
	},

    type: 'VirtualAgentChoicePagingUtil'
};
