var NLUModelList = Class.create();
NLUModelList.prototype = {
    initialize: function() {
        this.TABLES = global.NLUConstants.tables;
        this.PAGE_SIZE = 10;
        this.INCIDENT = 'incident';
        this.MODEL_OVERVIEW_LINK = "/$nlu-studio.do#/model-overview/";
        this.EFL_IAR_LINK = "/now/nlu-workbench/nlu-expert-feedback-loop/issue_auto_resolution";

        this.ACTIONS = [{
                id: "view-localization-request",
                label: gs.getMessage("View localization request"),
                action: "VIEW_LOCALIZATION_REQUEST"
            },
            {
                id: "editors",
                label: gs.getMessage("Manage editors"),
                action: "MANAGE_EDITORS"
            },
            {
                id: "add-language",
                label: gs.getMessage("Add a language"),
                action: "ADD_LANGUAGE"
            },
            {
                id: "duplicate-model",
                label: gs.getMessage("Duplicate this model"),
                action: "DUPLICATE_MODEL"
            },
            {
                id: "export-mode-csv",
                label: gs.getMessage("Export model as CSV"),
                action: "EXPORT_MODEL_CSV"
            },
            {
                id: "delete-this-model",
                label: gs.getMessage("Delete this model"),
                action: "DELETE_MODEL"
            }
        ];

        this.ADD_A_LANGUAGE_ACTION = {
            id: "add-language",
            label: gs.getMessage("Add a language"),
            action: "ADD_LANGUAGE"
        };

        this.DUPLICATE_MODEL_ACTION = {
            id: "duplicate-model",
            label: gs.getMessage("Duplicate this model"),
            action: "DUPLICATE_MODEL"
        };

        this.LANGUAGES = {
            "en": gs.getMessage("English"),
            "pb": gs.getMessage("Brazilian Portuguese"),
            "fq": gs.getMessage("Canadian French"),
            "zh": gs.getMessage("Chinese (Simplified)"),
            "da": gs.getMessage("Danish"),
            "nl": gs.getMessage("Dutch"),
            "fi": gs.getMessage("Finnish"),
            "fr": gs.getMessage("French"),
            "de": gs.getMessage("German"),
            "it": gs.getMessage("Italian"),
            "ja": gs.getMessage("Japanese"),
            "ko": gs.getMessage("Korean"),
            "nb": gs.getMessage("Norwegian"),
            "pl": gs.getMessage("Polish"),
            "pt": gs.getMessage("Portuguese"),
            "es": gs.getMessage("Spanish"),
            "sv": gs.getMessage("Swedish")
        };

        this.COLUMNS = {
            MODEL: 'model',
            STATUS: 'status',
            USED_IN: 'usedIn',
            MODEL_TYPE: 'modelType',
            ENABLED_INTENTS: 'enabledIntents',
            MAPPED_INTENTS: 'mappedIntents',
            LAST_MODIFIED: 'lastModified',
            LAST_PUBLISHED: 'lastPublished',
            VALUE: 'value',
            LABEL: 'label',
            LANGUAGE: 'language',
            TOTAL_INTENTS: 'totalIntents',
            LF_DETAILS_LINK: 'lfDetailsLink',
            MODEL_DISPLAY_NAME: 'modelDisplayName'
        };

        this.ALL_MAPPED_INTENTS = (new global.NLUInterfaceHelper()).getAllMappedIntentsCount();

        this.CATEGORIES = {
            'VIRTUAL_AGENT': 'virtual_agent',
            'ISSUE_AUTO_RESOLUTION': 'issue_auto_resolution',
            'SEARCH': 'search'
        };
        this.NUMBER_OF_IAR_INTENTS = 11;
        this.MODEL_STATUS = {
            DRAFT: 'draft',
            TRAINED: 'trained',
            TRAINING: 'training',
            FAILED: 'failed',
            CLONING: 'cloning',
            TRANSLATING: 'translating',
            PUBLISHED: 'published',
            ERROR_WHILE_TRANSLATING: 'error_while_translating'
        };

        this.REQUEST_PENDING_APPROVAL = gs.getMessage('Translation request pending approval');
        this.TRANSLATING = gs.getMessage('Translating...');
        this.ERROR_TRANSLATING = gs.getMessage('Error while translating');
        this.NEEDS_REVIEW = gs.getMessage('Needs Review');
        this.LFREQUESTEDITEM_ERROR_STATES = [this.ERROR_TRANSLATING];
        this.LFREQUESTEDITEM_STATUS_LABELS = {
            'Open': this.REQUEST_PENDING_APPROVAL,
            'In Progress': this.TRANSLATING,
            'Closed Complete': this.NEEDS_REVIEW,
            'Closed Incomplete': this.ERROR_TRANSLATING
        };
        this.LFREQUESTEDITEM_STATUS_TOOLTIPS = {
            'Closed Incomplete': gs.getMessage(
                "The translations couldn't be retrieved because of a system error. Contact your admin for support."
            )
        };
    },

    _showLfRequestedItemStatus: function(lfRequestedItem) {
        var showLf = false;
        if (lfRequestedItem) {
            showLf = lfRequestedItem.exists && lfRequestedItem.canRead && !lfRequestedItem.details.isClosed && (!lfRequestedItem.details.closedOn || model.modelUpdatedOn.value < lfRequestedItem.details.closedOn);
        }
        return showLf;
    },

    /**
     * Utility to fetch the status
     * 
     */
    _getStatus: function(model) {
        var statusString = gs.getMessage('Draft saved');
        var timeToShow = model.modelUpdatedOn;

        // first check if the model is trained/published and update the state/time accordingly
        if (model && model.trainedVersion && model.trainedVersion > 0) {
            var tVersion = Number(model.trainedVersion);
            var pVersion = Number(model.publishedVersion) || 0;
            if (pVersion >= tVersion) {
                statusString = gs.getMessage('Published');
                timeToShow = model.lastPublishedOn;
            } else {
                statusString = gs.getMessage('Trained');
                timeToShow = model.lastTrainedOn;
            }
        } else {
            switch (model.state) {
                case this.MODEL_STATUS.TRAINED:
                    if (model.dirty) {
                        statusString = gs.getMessage('Updated');
                    } else {
                        timeToShow = model.lastTrainedOn;
                        statusString = gs.getMessage('Trained');
                    }
                    break;
                case this.MODEL_STATUS.PUBLISHED:
                    if (model.dirty) {
                        statusString = gs.getMessage('Updated');
                    } else {
                        timeToShow = model.lastPublishedOn;
                        statusString = gs.getMessage('Published');
                    }
                    break;
                case this.MODEL_STATUS.TRAINING:
                    statusString = gs.getMessage('Training...');
                    timeToShow = null;
                    break;
                case this.MODEL_STATUS.CLONING:
                    statusString = gs.getMessage('Copying model...');
                    timeToShow = null;
                    break;
                case this.MODEL_STATUS.TRANSLATING:
                    statusString = gs.getMessage('Translation in progress...');
                    timeToShow = null;
                    break;
                case this.MODEL_STATUS.ERROR_WHILE_TRANSLATING:
                    statusString = this.ERROR_TRANSLATING;
                    tooltip = gs.getMessage(
                        "The translations couldn't be retrieved because of a system error. Contact your admin for support."
                    );
                    timeToShow = null;
                    break;
                default:
                    break;
            }

            if (model.showLf) {
                var requestedItemState = model.lfRequestedItem.details.status;
                if (requestedItemState) {
                    timeToShow = null;
                    statusString = this.LFREQUESTEDITEM_STATUS_LABELS[requestedItemState];
                }
            }
        }

        return {
            'statusString': statusString,
            'timeToShow': timeToShow,
        };

    },

    _getExcludedActionItems: function(state, showLf, isModelOOB, gr) {
        var primaryModel = gr.getValue('primary_model') === null;
        var excludedActionItems = this.ACTIONS.filter(function(item) {
            if (item.id == "view-localization-request")
                return !showLf || isModelOOB === "true";

            if (item.id == "editors")
                return gr.getValue('sys_policy') == 'read' || !gs.getUser().hasRole('nlu_admin') || isModelOOB === "true";

            if (item.id == "add-language")
                return !primaryModel || state == 'translating' || !(gr.canCreate() && (gr.getValue('sys_policy') !== 'read' || gs.getUser().hasRole('maint')));

            if (item.id == "duplicate-model")
                return state == 'cloning' || !gr.canCreate();

            if (item.id == "delete-this-model")
                return isModelOOB === "true" || !gr.canDelete();
        });

        var excludedItems = excludedActionItems.map(function(item) {
            return item.id;
        });

        return excludedItems;
    },

    /**
     * Main Utility to fetch the Models GR with category and filter.
     * This handles the conditions to create the GR
     */
    _getPrimaryModelsGrWithCategoryAndFilter: function(category, filter) {
        var primaryModelsGr = new GlideRecord(this.TABLES.SYS_NLU_MODEL);

        var qc = primaryModelsGr.addQuery('category', category);
        // this is to add the NLU Common Model to the VA Tab, this model does not have any category.
        if (category == "virtual_agent")
            qc.addOrCondition('category', 'ISEMPTY', "");

        if (!filter) {
            filter = {};
        }
        if (filter.searchText) {
            qc.addCondition('display_name', 'CONTAINS', filter.searchText);
        }

        if (filter.isOOB === "false" || filter.isOOB === false) {
            qc.addCondition('oob', false);
        }

        //If language filter is not applied then fetch only primary Models
        if (filter.language && filter.language !== 'all') {
            qc.addCondition('language', filter.language);
        } else {
            primaryModelsGr.addNullQuery('primary_model');
        }
        primaryModelsGr.orderByDesc('sys_updated_on');

        return primaryModelsGr;
    },

    /**
     * Utility to fetch the Models GR with category, filter, pageOffset
     * This mainly has the pagination logic.
     */
    _getPrimaryModelsGrWithPageOffset: function(primaryModelsGr, pageOffset) {
        var start = pageOffset * this.PAGE_SIZE;
        var end = start + this.PAGE_SIZE;

        primaryModelsGr.chooseWindow(start, end);
        primaryModelsGr.query();

        return primaryModelsGr;
    },

    /**
     * Utility to get the count of ALL the Primary Models
     */
    _getPrimaryModelsTotalCount: function(primaryModelsGr) {
        primaryModelsGr.query();

        return primaryModelsGr.getRowCount();
    },

    /**
     * Utility to fetch the Status GR for a given modelId
     */
    _getStatusGr: function(modelId) {
        var statusGr = new GlideRecord(this.TABLES.SYS_NLU_MODEL_STATUS);
        statusGr.addQuery('model', modelId);
        statusGr.query();
        return statusGr;

    },

    /**
     * Utiltity to fetch the Intent GR for a given modelId
     */
    _getIntentGr: function(modelId) {
        var intentGr = new GlideAggregate(this.TABLES.SYS_NLU_INTENT);
        intentGr.addQuery('model', modelId);
        intentGr.addQuery('enable', true);
        intentGr.addAggregate('COUNT');
        intentGr.query();
        return intentGr;
    },

    /**
     * Utility to set the languages array that is used for naming of Secondary Models.
     */
    _setLanguages: function() {
        var languages = global.NLUParloIntegrator.getSupportedLanguages();

        languages = languages.reduce(function(result, item) {
            result[item.value] = item.label;
            return result;
        }, {});


        if (languages && Object.keys(languages).length === 0)
            languages = this.LANGUAGES;

        return languages;

    },

    _getCell: function(value) {
        return {
            value: value
        };
    },

    /**
     * Utility to create a single row. This internally fetches the secondary Models of a Model and fetches it's rows too.
     * category : used for the Model Link URL
     * primaryModel : used to differentiate between primary and secondary Models
     */
    _getRow: function(category, gr, primaryModel, languages, filter) {

        var row = {};
        row['key'] = gr.getUniqueValue();
        row['type'] = "default"; // type=default for singlar rows.

        var cells = {};
        var isModelOOB = gr.getDisplayValue('oob');
        cells[this.COLUMNS.LANGUAGE] = this._getCell(gr.getValue('language'));
        cells[this.COLUMNS.LANGUAGE][this.COLUMNS.LABEL] = languages[gr.getValue('language')];
        cells[this.COLUMNS.MODEL] = this._getCell((category === 'issue_auto_resolution') ? this.EFL_IAR_LINK : this.MODEL_OVERVIEW_LINK + row['key']);
        cells[this.COLUMNS.MODEL_TYPE] = this._getCell(isModelOOB === "true" ? gs.getMessage('Pre-built') : gs.getMessage('Custom'));
        cells[this.COLUMNS.MAPPED_INTENTS] = this._getCell(this.ALL_MAPPED_INTENTS[gr.getValue('name')] || 0);

        if (category === this.CATEGORIES.ISSUE_AUTO_RESOLUTION) {
            cells[this.COLUMNS.TOTAL_INTENTS] = this._getCell(this.NUMBER_OF_IAR_INTENTS);
            cells[this.COLUMNS.MAPPED_INTENTS] = this._getCell(global.AutoResolutionAPI.getActiveMappedIntents(this.INCIDENT).length);
            cells[this.COLUMNS.LAST_PUBLISHED] = this._getCell(sn_nlu_workbench.NLUIARTuning.getIARModelPublishedTime(this.INCIDENT, "en"));
            cells[this.COLUMNS.STATUS] = this._getCell(gs.getMessage("Published"));
        } else {
            // TODO : This makes GlideRecords calls for each model, which might affect the performance.
            var statusGr = this._getStatusGr(row['key']);
            var lfRequestedItem = global.NLUTranslateUtil.getLfRequestedItemDetails([gr.getValue('primary_model')], [gr.getValue('language')])[0];
            var showLf = this._showLfRequestedItemStatus(lfRequestedItem);
            if (statusGr.next()) {
                var model = {
                    'state': statusGr.getValue('state'),
                    'dirty': Boolean(statusGr.getValue('dirty')),
                    'modelUpdatedOn': statusGr.getDisplayValue('model_updated_on'),
                    'lastTrainedOn': statusGr.getDisplayValue('last_trained_on'),
                    'trainedVersion': Number(statusGr.getValue('trained_version')),
                    'lastPublishedOn': statusGr.getDisplayValue('last_published_on'),
                    'publishedVersion': Number(statusGr.getValue('published_version')),
                    'trainStatus': "TESTED",
                    'lfRequestedItem': lfRequestedItem,
                    'showLf': showLf
                };
                var statusObject = this._getStatus(model);
                cells[this.COLUMNS.STATUS] = this._getCell(statusObject.statusString);
                cells[this.COLUMNS.LAST_MODIFIED] = this._getCell(statusObject.timeToShow);
                cells[this.COLUMNS.LAST_PUBLISHED] = this._getCell(model.lastPublishedOn);
                cells[this.COLUMNS.USED_IN] = this._getCell(model.publishedVersion > 0 && this.ALL_MAPPED_INTENTS[gr.getValue('name')] > 0 ? gs.getMessage("Yes") : gs.getMessage("No"));
                row['excludedActions'] = this._getExcludedActionItems(model.state, model.showLf, isModelOOB, gr);
                if (showLf) {
                    cells[this.COLUMNS.LF_DETAILS_LINK] = lfRequestedItem.details.link;
                }
            }

            // TODO : This makes GlideRecords calls for each model, which might affect the performance.
            var intentGr = this._getIntentGr(row['key']);
            if (intentGr.next()) {
                cells[this.COLUMNS.ENABLED_INTENTS] = this._getCell(intentGr.getAggregate('COUNT'));
            }
        }

        if (primaryModel) {
            // Primary Model without Secondary Models
            cells[this.COLUMNS.MODEL][this.COLUMNS.LABEL] = gr.getDisplayValue('display_name') + ' ' + '(' + languages[gr.getValue('language')] + ')';
            cells[this.COLUMNS.MODEL][this.COLUMNS.MODEL_DISPLAY_NAME] = gr.getDisplayValue('display_name');
            row['cells'] = cells;

            // Secondary Models not needed if language filter applied
            if (filter && filter.language && filter.language !== 'all')
                return row;

            var children = this._getSecondaryModelRows(row['key'], category, languages);

            if (children.length > 0) {
                //Primary Model with Secondary Models
                cells[this.COLUMNS.MODEL][this.COLUMNS.LABEL] = languages[gr.getValue('language')] + '(Primary)';
                cells[this.COLUMNS.MODEL][this.COLUMNS.MODEL_DISPLAY_NAME] = gr.getDisplayValue('display_name');
                row['cells'] = cells;
                children.unshift(row);

                var groupActions = [];
                // "Add a Language" action for Read Only Models and non Maint Users.
                if (gr.canCreate() && (gr.getValue('sys_policy') !== 'read' || gs.getUser().hasRole('maint')))
                    groupActions.push(this.ADD_A_LANGUAGE_ACTION);
                if (gr.canCreate())
                    groupActions.push(this.DUPLICATE_MODEL_ACTION);

                var parentRow = {};
                parentRow['key'] = 'Primary_' + gr.getUniqueValue();
                parentRow['groupedRowLabel'] = gr.getDisplayValue('display_name');
                parentRow[this.COLUMNS.MODEL_DISPLAY_NAME] = gr.getDisplayValue('display_name');
                parentRow['groupedRowCount'] = children.length;
                parentRow['groupActions'] = groupActions;
                parentRow['type'] = "grouped";
                parentRow['children'] = children;

                return parentRow;
            }
        } else {
            cells[this.COLUMNS.MODEL][this.COLUMNS.LABEL] = languages[gr.getValue('language')];
            cells[this.COLUMNS.MODEL][this.COLUMNS.MODEL_DISPLAY_NAME] = gr.getDisplayValue('display_name');
            row['cells'] = cells;
        }
        return row;
    },

    _getSecondaryModelRows: function(modelId, category, languages) {
        var secondaryModels = [];
        var secondaryModelsGr = new GlideRecord(this.TABLES.SYS_NLU_MODEL);
        secondaryModelsGr.addQuery('primary_model', modelId);
        secondaryModelsGr.query();

        while (secondaryModelsGr.next()) {
            var row = this._getRow(category, secondaryModelsGr, false, languages);
            secondaryModels.push(row);
        }
        return secondaryModels;
    },

    /**
     * Function exposed to the fetch the RowDefinition. This is the starting point of all the utilities. 
     */
    getRowDefinition: function(category, filter, pageOffset) {
        var primaryModelsGr = this._getPrimaryModelsGrWithCategoryAndFilter(category, filter);
        var totalRecords = this._getPrimaryModelsTotalCount(primaryModelsGr);

        var paginatedPrimaryModelsGr = this._getPrimaryModelsGrWithPageOffset(primaryModelsGr, pageOffset);

        var rowDefinition = {
            actions: {
                position: "end",
                numActionIcons: 0,
                actionsItems: this.ACTIONS
            },
            rows: []
        };

        if (category === this.CATEGORIES.ISSUE_AUTO_RESOLUTION) {
            delete rowDefinition.actions;
        }

        if (totalRecords == 0) {
            return rowDefinition;
        }

        var languages = this._setLanguages();

        while (paginatedPrimaryModelsGr.next()) {
            var row = this._getRow(category, paginatedPrimaryModelsGr, true, languages, filter);
            rowDefinition.rows.push(row);
        }

        return {
            rowDefinition: rowDefinition,
            totalRecords: totalRecords
        };
    },

    type: 'NLUModelList'
};
