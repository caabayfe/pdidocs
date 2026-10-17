            var RecommendedAction = Class.create();
            RecommendedAction.prototype = {
                initialize: function() {},

                getActionInputs: function() {
                    return this.actionInputs;
                },

                setActionInputs: function(actionInputs) {
                    this.actionInputs = actionInputs;
                },

                getAction: function() {
                    return this.action;
                },

                setAction: function(action) {
                    this.action = action;
                },

                getHint: function() {
                    return this.hint;
                },

                setHint: function(hint) {
                    this.hint = hint;
                },
                getGroups: function() {
                    return this.groups;
                },
                getGroupsAsArray: function() {
                    if (gs.nil(this.groups) || this.groups.length <= 0)
                        return;

                    return this.groups.split(",");
                },
                setGroups: function(groups) {
                    this.groups = groups;
                },

                setActionInputLabels: function(actionInputLabels) {
                    this.actionInputLabels = actionInputLabels;
                },
                getIsGenius: function() {
                    return this.isGenius;
                },
                setIsGenius: function(geniusId) {
                    if (geniusId)
                        return this.isGenius = true;

                    return this.isGenius = false;
                },
                getActionInputLabels: function() {
                    return this.actionInputLabels;
                },
                setSearchResultNumber: function(searchResultNumber) {
                    this.searchResultNumber = searchResultNumber;
                },
                setSearchResultTable: function(searchResultTable) {
                    this.searchResultTable = searchResultTable;
                },
                setSearchResultId: function(searchResultId) {
                    this.searchResultId = searchResultId;
                },
                setSearchResultTitle: function(searchResultTitle) {
                    this.searchResultTitle = searchResultTitle;
                },
                setSearchResultURL: function(searchResultURL) {
                    this.searchResultURL = searchResultURL;
                },
                setSearchResultDocIndex: function(searchResultDocIndex) {
                    this.searchResultDocIndex = searchResultDocIndex;
                },
                setSearchResultAISDocId: function(searchResultAISDocId) {
                    this.searchResultAISDocId = searchResultAISDocId;
                },
                type: 'RecommendedAction'
            };

            RecommendedAction.createFromRule = function(action, actionInputs, hint, /* comma separated string*/
                groups, actionInputLabels) {
                var recommendedActionObj = new RecommendedAction();
                recommendedActionObj.setAction(action);
                recommendedActionObj.setActionInputs(actionInputs);
                recommendedActionObj.setHint(hint);
                recommendedActionObj.setGroups(groups);
                recommendedActionObj.setActionInputLabels(actionInputLabels || {});
                return recommendedActionObj;
            };

            RecommendedAction.createFromSearchRecord = function(action, actionInputs, hint, actionInputLabels, geniusId, aisOutput) {
                var recommendedActionObj = new RecommendedAction();
                var searchResultNumber = aisOutput.search_result_number;
                recommendedActionObj.setSearchResultNumber(searchResultNumber);
                var searchResultTable = aisOutput.search_result_table;
                recommendedActionObj.setSearchResultTable(searchResultTable);
                var searchResultId = aisOutput.search_result_sysId;
                recommendedActionObj.setSearchResultId(searchResultId);
                var searchResultTitle = aisOutput.search_result_title;
                recommendedActionObj.setSearchResultTitle(searchResultTitle);
                var searchResultURL = aisOutput.search_result_url;
                recommendedActionObj.setSearchResultURL(searchResultURL);
                var searchResultDocIndex = aisOutput.search_result_doc_index;
                recommendedActionObj.setSearchResultDocIndex(searchResultDocIndex);
                var searchResultAISDocId = aisOutput.search_result_doc_id;
                recommendedActionObj.setSearchResultAISDocId(searchResultAISDocId);
                recommendedActionObj.setAction(action);
                recommendedActionObj.setActionInputs(actionInputs);
                recommendedActionObj.setHint(hint);
                recommendedActionObj.setActionInputLabels(actionInputLabels);
                recommendedActionObj.setIsGenius(geniusId);
                return recommendedActionObj;
            };
