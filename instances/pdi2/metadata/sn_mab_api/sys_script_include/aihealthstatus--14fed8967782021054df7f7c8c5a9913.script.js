class AiHealthStatus {
  constructor() {
    this.aisStatusApi = new sn_ais.StatusApi();
    this.pluginManager = new GlidePluginManager();
    this.versioningHelper = new AisVersioningHelper();
    this.configHelper = new AisPlatformConfigHelper();
    this.indexingService = new AisIndexingService();
  }

  isAisInstalled() {
    return this.pluginManager.isActive('com.glide.ais');
  }

  isAisEnabled() {
    return this.aisStatusApi.isAisEnabled();
  }

  isAisInitialized() {
    return this.aisStatusApi.isAisInitialized();
  }

  isAisQueueWritable() {
    return this.aisStatusApi.isAisQueueWritable();
  }

  isSemanticSearchInstalled() {
    return this.pluginManager.isActive('com.glide.ais.semantic_search');
  }

  isNowAssistInstalled() {
    return this.pluginManager.isActive('com.now_assist_core');
  }

  isAisEnabledForMab() {
    var propertyName = 'sn_mab_api.is.ais.enabled';

    var gr = new GlideRecord('sys_properties');
    gr.addQuery('name', propertyName);
    gr.query();

    if (gr.next()) {
      return gr.getValue('value') === 'true';
    } else {
      return false;
    }
  }

  isAisOnRagArchitecture() {
    return this.versioningHelper.isAisRagEnabled;
  }

  currentAisNodeVersion() {
    return this.versioningHelper.currentAisNodeVersion;
  }

  aisIndexAudit() {
    var indexAudit = '-------------------\n';

    this.configHelper.getAisTables().forEach(table => {
      var hasBeenIndexed = this.indexingService._hasSourceBeenIndexed(table);

      var currentAudit = `Table: ${table}\n`;
      currentAudit += `Has Been Indexed: ${hasBeenIndexed}\n`;

      if (hasBeenIndexed) {
        currentAudit += `Latest Index SysId: ${this.indexingService._getLatestIndexSysId(table)}\n`;
        currentAudit += `Latest Index Date Completed: ${this.indexingService._getLatestIndexDate(table)}\n`;
        
        var hasSemanticEmbedding = this.indexingService._hasSemanticEmbedding(table);
        var hasEmbeddingStatsOnLatestIndex = this.indexingService._hasEmbeddingStatsOnLatestIndex(table);
        currentAudit += `Is Latest Index RAG Compatible (this is true if the following two are true): ${hasSemanticEmbedding && hasEmbeddingStatsOnLatestIndex}\n`;
        currentAudit += `Does Indexed Source Have Semantic Embedding: ${hasSemanticEmbedding}\n`;
        currentAudit += `Does Latest Index Have Semantic Embeddings: ${hasEmbeddingStatsOnLatestIndex}\n`;
      }

      currentAudit += '-------------------\n';
      indexAudit += currentAudit;
    });

    return indexAudit;
  }

  // We have this check to ensure we don't block MAB during
  // the rare occurance of AIS Event Processor hanging.
  isAisIndexEventProcessorRunning() {
    var scheduledItemSysId = '2e2f762453320010bca8ddeeff7b1254';
    var scheduledItem = new GlideRecord('sys_trigger');
    scheduledItem.addQuery('sys_id', scheduledItemSysId);
    scheduledItem.query();

    var isRunning = false;
    if (scheduledItem.next()) {
      if (scheduledItem.state == '1') {
        isRunning = true;
      }
    }

    return isRunning;
  }

  areAllSystemsOperationalForAisInMab() {
    return (
      this.isAisInstalled() &&
      this.isAisEnabled() &&
      this.isAisInitialized() &&
      this.isAisQueueWritable() &&
      this.isSemanticSearchInstalled() &&
      this.isNowAssistInstalled() &&
      this.isAisEnabledForMab() &&
      !this.isAisIndexEventProcessorRunning()
    );
  }
}

module.exports = AiHealthStatus;
