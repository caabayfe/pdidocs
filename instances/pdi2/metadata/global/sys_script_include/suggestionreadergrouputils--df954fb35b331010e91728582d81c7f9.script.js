var SuggestionReaderGroupUtils = Class.create();
SuggestionReaderGroupUtils.prototype = {

    READER_GROUP_TABLE_CONTEXT_LINKING_FIELD: 'context_config_id',
    READER_GROUP_TABLE: 'sys_suggestion_reader_group',

    initialize: function() {
        // Configured Readers
        var USER_SEARCH_TERM_READER = '4b1cb27053231010dda1ddeeff7b12b8';
        var USER_HISTORY_READER = '1ee419777320001052c7d5fdbdf6a7ad';
        var POPULAR_QUERY_READER = 'ddf6d5b77320001052c7d5fdbdf6a76f';
        var PERSONAL_CLICK_READER = 'ec49ee515b511010627eed35cc81c7b9';
        var USER_HISTORY_AND_CLICK_READER = 'f8495b9077210110be280d892c5a9986';
        var QUERY_CONTENT_READER = 'c41365e077020110be280d892c5a99f2';
        var SUGGESTED_UTTERANCES = 'ab822a20ff0022103910ffffffffff7e';

        this.READER_GROUP_TO_READER_M2M_TABLE =
            'm2m_sys_suggestion_reader_sys_suggestion_reader_group';
        this.READER_GROUP_M2M_GROUP_LINKING_FIELD = 'sys_suggestion_reader_group_id';
        this.READER_GROUP_M2M_GROUP_READER_FIELD = 'sys_suggestion_reader_id';
        this.CLICK_IN_MODEL_FIELD = 'click_in_mode';
        this.NON_TABLE_FIELDS = ['autoLink', 'readers'];
        this.READER_GROUP_DATA = [{
                suggestion_type: 'Recent Search Reader Group for ',
                section_header: 'Recent searches',
                limit: 5,
                click_in_mode: true,
                order: 100,
                readers: [{
                    sys_suggestion_reader_id: USER_HISTORY_READER,
                    order: 100,
                }, ],
                autoLink: true
            },
            {
                suggestion_type: 'Popular Search Reader Group for ',
                section_header: 'Popular searches',
                limit: 5,
                click_in_mode: true,
                order: 200,
                readers: [{
                    sys_suggestion_reader_id: POPULAR_QUERY_READER,
                    order: 100,
                }, ],
                autoLink: false
            },
            {
                suggestion_type: 'ServiceNow Otto Suggested Query Reader Group for ',
                section_header: 'Ask ServiceNow Otto',
                limit: 3,
                click_in_mode: false,
                order: 250,
                readers: [{
                    sys_suggestion_reader_id: SUGGESTED_UTTERANCES,
                    order: 100,
                }, ],
                autoLink: false
            },
            {
                suggestion_type: 'Suggested Query Reader Group for ',
                section_header: '',
                limit: 5,
                click_in_mode: false,
                order: 300,
                readers: [{
                        sys_suggestion_reader_id: USER_SEARCH_TERM_READER,
                        order: 100,
                    },
                    {
                        sys_suggestion_reader_id: USER_HISTORY_READER,
                        order: 200,
                    },
                    {
                        sys_suggestion_reader_id: POPULAR_QUERY_READER,
                        order: 300,
                    },
                ],
                autoLink: false
            },
            {
                suggestion_type: 'Suggested Result Reader Group for ',
                section_header: 'Suggested results',
                limit: 5,
                click_in_mode: false,
                order: 400,
                readers: [{
                    sys_suggestion_reader_id: PERSONAL_CLICK_READER,
                    order: 100,
                }, ],
                autoLink: false
            },
            {
                suggestion_type: 'User History Reader Group for ',
                section_header: 'Recently viewed',
                limit: 5,
                click_in_mode: false,
                order: 500,
                readers: [{
                        sys_suggestion_reader_id: USER_SEARCH_TERM_READER,
                        order: 100,
                    },
                    {
                        sys_suggestion_reader_id: USER_HISTORY_AND_CLICK_READER,
                        order: 200,
                    }
                ],
                autoLink: true
            },
            {
                suggestion_type: 'Search-based Suggested Results Reader Group for ',
                section_header: 'Suggested',
                limit: 5,
                click_in_mode: false,
                order: 600,
                readers: [{
                    sys_suggestion_reader_id: QUERY_CONTENT_READER,
                    order: 100,
                }, ],
                autoLink: true
            }
        ];
    },

    /** 
     * Iterate over the desired reader groups and create their records for the provided search context config if necessary */
    createSuggestionReaderGroupsIfNeeded: function(searchContextConfigId, searchContextConfigName) {
        // Get existing suggestion reader group IDs
        var existingReaderGroupIDs = [];
        var readerGroupGR = new GlideRecord(this.READER_GROUP_TABLE);
        readerGroupGR.addQuery(this.READER_GROUP_TABLE_CONTEXT_LINKING_FIELD, searchContextConfigId);
        readerGroupGR.query();
        while (readerGroupGR.next())
            existingReaderGroupIDs.push(readerGroupGR.getUniqueValue());

        var readerIDsOfMode = this._getExistingReaders(existingReaderGroupIDs);

        var that = this;
        this.READER_GROUP_DATA.forEach(function(groupJson) {
            /** check if this group has already existed in the search application config, if so, skip creating it. */
            if (that._groupHasExisted(groupJson, readerIDsOfMode))
                return;
            that.createSingleSuggestionReaderGroup(groupJson, searchContextConfigId, searchContextConfigName);
        });
    },

    createSingleSuggestionReaderGroup: function(groupJson, searchContextConfigId, searchContextConfigName) {
        var readerGroupRecord = new GlideRecord('sys_suggestion_reader_group');
        readerGroupRecord.initialize();

        // Link the new reader group to the context, if it should be auto-linked.
        // Some shouldn't be linked because they are legacy reader groups, but we 
        // want to give admins the option of adding them back so still need to create them
        if (groupJson.autoLink) {
            readerGroupRecord.setValue(
                this.READER_GROUP_TABLE_CONTEXT_LINKING_FIELD,
                searchContextConfigId
            );
        }

        // Copy the data onto the new GlideRecord
        for (var field in groupJson) {
            if (groupJson.hasOwnProperty(field) && !this.NON_TABLE_FIELDS.includes(field)) {
                var fieldVal = groupJson[field];
                if (field === 'suggestion_type') {
                    fieldVal = fieldVal + searchContextConfigName;
                }
                readerGroupRecord.setValue(field, fieldVal);
            }
        }
        readerGroupRecord.insert();

        // Create the corresponding m2m entries to link readers to this new reader group
        var that = this;
        groupJson.readers.forEach(function(readerJson) {
            that._mapReaderGroupToReader(readerGroupRecord.getUniqueValue(), readerJson);
        });
    },

    /** 
     * For the given SAC, unlinks any group that isn't configured for autolinking, 
     * and links any that are (provided they aren't already linked)
     * NOTE: Assumes all relevant groups already exist
     */
    swapOutLegacyReaderGroupsForSAC: function(sacID, sacName) {
        for (var i = 0; i < this.READER_GROUP_DATA.length; i++) {
            var groupJson = this.READER_GROUP_DATA[i];
            var readerGroupRecord = new GlideRecord('sys_suggestion_reader_group');
            readerGroupRecord.addQuery('suggestion_type', groupJson.suggestion_type + sacName);
            readerGroupRecord.query();
            if (readerGroupRecord.next()) {
                var existingLinkID = readerGroupRecord.getValue(this.READER_GROUP_TABLE_CONTEXT_LINKING_FIELD);
                if (groupJson.autoLink && (existingLinkID == '' || existingLinkID == null)) {
                    readerGroupRecord.setValue(this.READER_GROUP_TABLE_CONTEXT_LINKING_FIELD, sacID);
                    readerGroupRecord.update();
                } else if (!groupJson.autoLink && existingLinkID == sacID) {
                    readerGroupRecord.setValue(this.READER_GROUP_TABLE_CONTEXT_LINKING_FIELD, '');
                    readerGroupRecord.update();
                }
            }
        }
    },

    /** Creates an M2M record to map the specified reader group to the specified reader */
    _mapReaderGroupToReader: function(groupID, readerJson) {
        var m2mRecord = new GlideRecord(this.READER_GROUP_TO_READER_M2M_TABLE);
        m2mRecord.initialize();
        m2mRecord.setValue(this.READER_GROUP_M2M_GROUP_LINKING_FIELD, groupID);
        // Copy the data onto the new GlideRecord
        for (var field in readerJson) {
            if (readerJson.hasOwnProperty(field)) {
                m2mRecord.setValue(field, readerJson[field]);
            }
        }
        m2mRecord.insert();
    },

    /** Get existing readers for click-in mode and type-in mode */
    _getExistingReaders: function(groupIDs) {
        var m2mRecord = new GlideRecord(this.READER_GROUP_TO_READER_M2M_TABLE);
        m2mRecord.addQuery(this.READER_GROUP_M2M_GROUP_LINKING_FIELD, groupIDs);
        m2mRecord.query();
        var readerIDsOfMode = {
            click_in: [],
            type_in: [],
        };
        while (m2mRecord.next()) {
            var clickInMode = m2mRecord[this.READER_GROUP_M2M_GROUP_LINKING_FIELD][this.CLICK_IN_MODEL_FIELD];
            if (clickInMode)
                readerIDsOfMode.click_in.push(m2mRecord[this.READER_GROUP_M2M_GROUP_READER_FIELD].toString());
            else
                readerIDsOfMode.type_in.push(m2mRecord[this.READER_GROUP_M2M_GROUP_READER_FIELD].toString());
        }
        return readerIDsOfMode;
    },

    /** check if the groupJson has existed */
    _groupHasExisted: function(groupJson, readerIDsOfMode) {
        var clickInMode = groupJson.click_in_mode;
        var readersToBeCreated = [];
        groupJson.readers.forEach(function(reader) {
            readersToBeCreated.push(reader.sys_suggestion_reader_id);
        });

        var existedReaders;
        if (clickInMode)
            existedReaders = readerIDsOfMode.click_in;
        else
            existedReaders = readerIDsOfMode.type_in;

        if (this._overlappedArrays(readersToBeCreated, existedReaders))
            return true;

        return false;
    },

    _overlappedArrays: function(arr1, arr2) {
        return arr1.filter(function(n) {
            return arr2.indexOf(n) > -1;
        }).length > 0;
    },

    type: 'SuggestionReaderGroupUtils'
};
