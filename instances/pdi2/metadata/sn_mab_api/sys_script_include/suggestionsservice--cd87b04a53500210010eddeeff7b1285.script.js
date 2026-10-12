class SuggestionsService {
  constructor() {
    this.searchApi = new sn_search.ScriptableSearchAPI();
    this.ragApi = new sn_search.RAGRetrievalAPI();
    this.aisVersioningHelper = new AisVersioningHelper();
    this.aisPlatformConfigHelper = new AisPlatformConfigHelper();
    
    // Default & private semantic configurations for all requests unless overridden by one of our setter functions
    this._semanticConfiguration = {
      documentMatchCount: 10,
      documentMatchThreshold: 0.7,
      embeddingModelId: 'E5FT',
      groupBy: 'ALL',
      semanticIndexNames: 'content'
    };
  }
  
  setDocumentMatchCount(count) {
    this._semanticConfiguration.documentMatchCount = count;
  }

  setDocumentMatchThreshold(threshold) {
    this._semanticConfiguration.documentMatchThreshold = threshold;
  }

  setEmbeddingModelId(modelId) {
    this._semanticConfiguration.embeddingModelId = modelId;
  }

  setGroupBy(groupBy) {
    this._semanticConfiguration.groupBy = groupBy;
  }

  setSemanticIndexNames(indexNames) {
    this._semanticConfiguration.semanticIndexNames = indexNames;
  }

  getSuggestions(table, query, fields = [], condition = null, searchProfile = null) {
    if (!fields.length) {
      fields = this.aisPlatformConfigHelper.getDefaultSearchResultFields(table);
    }

    if (this.aisVersioningHelper.isAisRagEnabled) {
      return this._getSuggestionsByRagApi(table, query, fields, condition, searchProfile);
    } else {
      return this._getSuggestionsBySearchApi(table, query, fields);
    }
  }

  _getSuggestionsByRagApi(table, query, fields, condition, searchProfile) {
      const request = this._createRagRetrievalRequest(table, query, fields, condition, searchProfile);
      const response = this.ragApi.retrieve(request);
  
      return {
          count: response.getCount(),
          results: this._formatRagApiResponse(response, table),
      };
  }
  
  _createRagRetrievalRequest(table, query, fields, condition, searchProfile) {
      // Our own naming convention for search profiles
      // sn_mab_api_mab_<table> is the default search profile for all mobile tables
      // A custom search profile outside of our default will need to be passed in
      if (!searchProfile) {
        searchProfile = `sn_mab_api_mab_${table}`;
      }

      const request = new sn_search.RAGRetrievalRequest()
          .searchProfile(searchProfile)
          .sources([this._createRagRetrievalSource(table, fields, condition)])
          .query(query);
  
      request.semanticConfiguration(this._createSemanticConfiguration());
  
      return request;
  }
  
  _createRagRetrievalSource(table, fields, condition) {
      return new sn_search.RAGRetrievalSource()
          .sourceTableName(table)
          .condition(condition)
          .filter(true)
          .fields(fields);
  }
  
  _createSemanticConfiguration() {
    const config = this._semanticConfiguration;
    return new sn_search.RAGRetrievalSemanticConfiguration()
      .documentMatchCount(config.documentMatchCount)
      .documentMatchThreshold(config.documentMatchThreshold)
      .embeddingModelId(config.embeddingModelId)
      .groupBy(config.groupBy)
      .semanticIndexNames([config.semanticIndexNames]);
  }

  _formatRagApiResponse(response, table) {
    var responseArr = [];
    var searchResults = response.getSearchResults();
    for (var i = 0; i < searchResults.length; i++) {
      var result = searchResults[i];
      var columns = result.getColumns();
      var obj = {
        score: result.getScore(),
        semanticSimilarity: result.getSemanticSimilarity(),
      };
      for (var key in columns) {
        if (columns.hasOwnProperty(key)) {
          var fieldName = key;
          var value = columns[key];
          if (fieldName === 'sys_scope') {
            obj['sys_scope_id'] = value;
            obj['sys_scope_name'] = this._fetchScopeName(value);
          } else {
            obj[fieldName] = value;
          }
        }
      }
      if (table === 'sys_sg_icon') {
        obj['isImageRef'] = false;
        if (obj.hasOwnProperty('type') && obj.hasOwnProperty('icon')) {
          obj['isImageRef'] = this._isImageRef(obj['type'], obj['icon']);
        }
      }
      responseArr.push(obj);
    }
    return responseArr;
  }

  // Note: The ScriptableSearchAPI will be deprecated in the future after AIS Node Version is updated to 100.0.0.0
  // When this occure, please remove _getSuggestionsBySearchApi and _formatSearchApiResponse
  _getSuggestionsBySearchApi(query, table, fields) {
    var table = table;
    var searchTerm = query;
    var searchContextConfigId = this.searchApplicationIdByTable[table];
    var paginationToken = '';
    var disableSpellCheck = false;
    var facetFilters = [];
    var searchFilters = [];
    var requestedFields = {};
    var fields = fields;
    if (typeof fields === 'string') {
      requestedFields[table] = fields.split(',');
    } else {
      requestedFields[table] = this.requestedFieldsByTable[table];
    }
    var locale = 'en';
    var additionalContextJson = {
      additional_filters: [],
    };
    var additionalContext = JSON.stringify(additionalContextJson);
    var isSemanticSearch = true
    var isDebug = false;
    var forceSkipSignalsLogging = false;

    var response = this.searchApi.search(
      searchContextConfigId,
      searchTerm,
      paginationToken,
      disableSpellCheck,
      facetFilters,
      searchFilters,
      requestedFields,
      locale,
      additionalContext,
      isSemanticSearch,
      isDebug,
      forceSkipSignalsLogging
    );

    return {
      count: response.getCount(),
      results: this._formatSearchApiResponse(response, table),
    };
  }

  _formatSearchApiResponse(response, table) {
    var responseArr = [];
    var searchResults = response.getSearchResults();
    for (var i = 0; i < searchResults.length; i++) {
      var result = searchResults[i];
      var columns = result.getColumns();
      var obj = {
        score: result.getScore(),
      };
      for (var j = 0; j < columns.length; j++) {
        var column = columns[j];
        var fieldName = column.getFieldName();
        var value = column.getValue();
        if (fieldName === 'sys_scope') {
          obj['sys_scope_id'] = value;
          obj['sys_scope_name'] = this._fetchScopeName(value);
        } else {
          obj[fieldName] = value;
        }
      }
      if (table === 'sys_sg_icon') {
        obj['isImageRef'] = false;
        if (obj.hasOwnProperty('type') && obj.hasOwnProperty('icon')) {
          obj['isImageRef'] = this._isImageRef(obj['type'], obj['icon']);
        }
      }
      responseArr.push(obj);
    }
    return responseArr;
  }

  _fetchScopeName(scopeId) {
    var gr = new GlideRecord('sys_scope');
    if (gr.get(scopeId)) {
      return gr.getValue('name');
    }
    return '';
  }

  _isImageRef(type, icon) {
    var iconObj = JSON.parse(icon);
    if (iconObj && typeof iconObj === 'object') {
      return type === 'image' && iconObj.Name === 'ImageRef';
    }
    return false;
  }
}

module.exports = SuggestionsService;
