class AisIndexingService {
    constructor() {
        this.aisVersioningHelper = new AisVersioningHelper();
        this.aisPlatformConfigHelper = new sn_mab_api.AisPlatformConfigHelper();
    }

    indexAndPublishAllUnindexedSources() {
        this.aisPlatformConfigHelper.getAisTables().forEach(table => {
            if (!this._hasSourceBeenIndexed(table)) {
                this._indexAndPublishTable(table);
                return;
            }
    
            if (this._hasSemanticEmbedding(table)) {
                if (!this._hasEmbeddingStatsOnLatestIndex(table)) {
                    this._indexAndPublishTable(table);
                }
            }
        });
    }

    _indexAndPublishTable(table) {
        sn_ais.AisUtil.indexDatasource(table);

        const publishedName = "sn_mab_api_mab_" + table;
        new sn_ais.Synchronizer().publishProfile(publishedName);
    }

    _hasSourceBeenIndexed(table) {
        var gr = new GlideRecord('ais_ingest_datasource_stats');
        gr.addQuery('datasource', table);
        gr.query();
        return gr.next();
    }

    _getLatestIndexSysId(table) {
        var gr = new GlideRecord('ais_ingest_datasource_stats');
        gr.addQuery('datasource', table);
        gr.orderByDesc('sys_created_on');
        gr.query();
        if (gr.next()) {
            return gr.sys_id;
        }
        return null;
    }

    _getLatestIndexDate(table) {
        var gr = new GlideRecord('ais_ingest_datasource_stats');
        gr.addQuery('datasource', table);
        gr.orderByDesc('sys_created_on');
        gr.query();
        if (gr.next()) {
            return gr.end;
        }
        return null;
    }

    _hasSemanticEmbedding(table) {
        var gr = new GlideRecord('ais_semantic_index_configuration');
        gr.addQuery('datasource', table);
        gr.query();
        return gr.next();
    }

    _hasEmbeddingStatsOnLatestIndex(table) {
        var index = this._getLatestIndexSysId(table);
        var gr = new GlideRecord('ais_ingest_embedding_stats');
        gr.addQuery('datasource_stats', index);
        gr.query();
        return gr.next();
    }
    
}

module.exports = AisIndexingService;
