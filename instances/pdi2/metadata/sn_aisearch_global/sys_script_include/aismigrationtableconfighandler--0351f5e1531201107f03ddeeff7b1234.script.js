var AisMigrationTableConfigHandler = Class.create();
AisMigrationTableConfigHandler.prototype = {

    AIS_INDEX_ATTACHMENT_DEFAULT: 'true',
    AIS_INDEX_TRANSLATE_DEFAULT: 'false',
    AIS_INDEX_TAGS_DEFAULT: 'none',

    initialize: function(migrationSysID) {
        this.migrationSysID = migrationSysID;
        this.logger = new AisMigrationLogger(migrationSysID, 'TableConfigHandler');
    },

    migrateAttributes: function(tableName, indexSourceId) {
        this._setAttachmentIndexValue(tableName, indexSourceId);
        this._setIndexTranslatedValue(tableName, indexSourceId);
        this._setIndexTagsValue(tableName, indexSourceId);
    },

    _setAttachmentIndexValue: function(tableName, indexSourceId) {
        var attributeAttachmentIndexSysId = '748de53b53032300d0baddeeff7b123d'; // ID of attachment_index attribute for Zing
        var indexAttachmentAttributeSysId = '2dd8f14753320010ffaaddeeff7b1293'; // Attribute ID for AIS

        var gr = new GlideRecord('ts_table_attribute_map');
        gr.addQuery('table', tableName);
        gr.addQuery('name', attributeAttachmentIndexSysId);
        gr.query();
        var aisAttributeValue = 'false';
        if (gr.next()) {
            aisAttributeValue = gr.value;
        }

        if (aisAttributeValue == 'true') {
            var rootTable = new GlideTableHierarchy(tableName).getRoot();
            // task table attachments can bloat the size of AIS index. We will set it to false and let the customer set it to true if they wish
            if (rootTable === 'task') {
                aisAttributeValue = false;
            }
        }

        if (aisAttributeValue != this.AIS_INDEX_ATTACHMENT_DEFAULT)
            this._insertTableAttribute(indexSourceId, tableName, indexAttachmentAttributeSysId, aisAttributeValue);
    },

    _setIndexTranslatedValue: function(tableName, indexSourceId) {
        var indexTranslatedSysId = '704da53b53032300d0baddeeff7b12a3'; // ID of text_index_translations attribute for Zing
        var aisIndexTranslatedSysId = 'e2bd2451b7021010ba148481de11a970'; // ID of index_translated_fields attribute for AIS

        var gr = new GlideRecord('ts_table_attribute_map');
        gr.addQuery('table', tableName);
        gr.addQuery('name', indexTranslatedSysId);
        gr.query();
        var zingIndexTranslated = 'false';
        if (gr.next()) {
            zingIndexTranslated = gr.value;
        }
        var aisAttributeValue = this.AIS_INDEX_TRANSLATE_DEFAULT;

        if (zingIndexTranslated == 'true')
            aisAttributeValue = true;

        if (aisAttributeValue != this.AIS_INDEX_TRANSLATE_DEFAULT)
            this._insertTableAttribute(indexSourceId, tableName, aisIndexTranslatedSysId, aisAttributeValue);
    },

    _setIndexTagsValue: function(tableName, indexSourceId) {
        var indexTagsSysId = '332d653b53032300d0baddeeff7b128a'; // ID of text_index_tags attribute for Zing
        var aisIndexTagsSysId = '158a3890b7221010ba148481de11a9d1'; // ID of index_tags attribute for for AIS

        var gr = new GlideRecord('ts_table_attribute_map');
        gr.addQuery('table', tableName);
        gr.addQuery('name', indexTagsSysId);
        gr.query();
        var zingIndexTags = null;
        if (gr.next()) {
            zingIndexTags = gr.value;
        }

        var aisAttributeValue = this.AIS_INDEX_TAGS_DEFAULT;

        if (zingIndexTags != null && (zingIndexTags == 'all_shared' || zingIndexTags == 'everyone_only')) // Take valid values
            aisAttributeValue = zingIndexTags;

        if (aisAttributeValue != this.AIS_INDEX_TAGS_DEFAULT)
            this._insertTableAttribute(indexSourceId, tableName, aisIndexTagsSysId, aisAttributeValue);
    },

    _insertTableAttribute: function(indexSourceSysId, tableName, attribute, attributeValue) {
        var migrationRecord = new AisMigrationRecord(this.migrationSysID, 'ais_datasource_attribute');
        migrationRecord.setValue('attribute', attribute);
        migrationRecord.setValue('source', tableName);
        migrationRecord.setValue('datasource', indexSourceSysId);
        migrationRecord.setValue('value', attributeValue);
        migrationRecord.insert();
    },

    addChildTables: function(tableName, indexSourceId) {
        var childTables = new GlideTableHierarchy(tableName).getTableExtensions();

        for (var i in childTables) {
            var textIndex = true;
            var dict = new GlideRecord('sys_dictionary');
            dict.addEncodedQuery("nameIN" + childTables[i] + "^internal_type=collection^attributesLIKEno_text_index=true");
            dict.query();
            if (dict.next()) {
                textIndex = false;
                this.logger.info('Indexing disabled for child table: ' + childTables[i]);
            }
            this._insertChildTable(indexSourceId, childTables[i], textIndex);
        }
    },

    _insertChildTable: function(indexSourceSysId, tableName, active) {
        var migrationRecord = new AisMigrationRecord(this.migrationSysID, 'ais_child_table');
        migrationRecord.setValue('datasource', indexSourceSysId);
        migrationRecord.setValue('table', tableName);
        migrationRecord.setValue('active', active);
        migrationRecord.insert();
    },

    type: 'AisMigrationTableConfigHandler'
};
