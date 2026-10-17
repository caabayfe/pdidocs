var RAGResponseGeneratorConstants = Class.create();
RAGResponseGeneratorConstants.prototype = {
    initialize: function() {},

    type: 'RAGResponseGeneratorConstants'
};

RAGResponseGeneratorConstants.DEFAULT_CALLING_SOURCE = "Scripted REST API";
RAGResponseGeneratorConstants.DEFAULT_DOCUMENT_MATCH_THRESHOLD = 0.0;
RAGResponseGeneratorConstants.DEFAULT_DOCUMENT_MATCH_COUNT = 1000;
RAGResponseGeneratorConstants.DEFAULT_EMBEDDING_MODEL = "E5FT";
RAGResponseGeneratorConstants.DEFAULT_SEMANTIC_INDEX_NAMES = ['title', 'body'];
RAGResponseGeneratorConstants.DEFAULT_SEMANTIC_MODE = 'KEYWORD';
RAGResponseGeneratorConstants.DEFAULT_SEMANTIC_GROUPBY = 'ALL';
RAGResponseGeneratorConstants.DEFAULT_BOOLEAN_MODE = 'OR';
RAGResponseGeneratorConstants.DEFAULT_Q_THRESHOLD = ['80'];
RAGResponseGeneratorConstants.DEFAULT_SEMANTIC_MODEL = ['semantic_title_body'];
RAGResponseGeneratorConstants.DEFAULT_RRFK = ['3'];
RAGResponseGeneratorConstants.DEFAULT_Q_TYPE = ['glide.v2'];
RAGResponseGeneratorConstants.DEFAULT_LIMIT = 10;
RAGResponseGeneratorConstants.DEFAULT_SORT_FIELD = '.score';

RAGResponseGeneratorConstants.CHUNKING_PARAMETER_MAX_PASSAGES_PER_DOC = "maxPassagesPerDoc";
RAGResponseGeneratorConstants.CHUNKING_PARAMETER_CHUNK_SIZE = "limit";
RAGResponseGeneratorConstants.CHUNKING_PARAMETER_CHUNK_UNIT = "limit_type";
RAGResponseGeneratorConstants.CHUNKING_PARAMETER_EXPANDED_SNIPPET_SIZE = "expanded_snippet_size";
RAGResponseGeneratorConstants.CHUNKING_MODE_SMALL_TO_BIG = "SMALL_TO_BIG";
RAGResponseGeneratorConstants.EXPANSION_STRATEGY_BIDIRECTIONAL = "BIDIRECTIONAL";
RAGResponseGeneratorConstants.SNIPPET_EXPANSION_COUNT = '3';

RAGResponseGeneratorConstants.DATASOURCE_TYPE_EXTERNAL = "external";
RAGResponseGeneratorConstants.KB_SOURCE_TABLE = "kb_knowledge";
RAGResponseGeneratorConstants.CATALOG_SOURCE_TABLE = "sc_cat_item";
RAGResponseGeneratorConstants.SKILL_SOURCE_TABLE = "sys_gen_ai_skill";

RAGResponseGeneratorConstants.DOCUMENT_TYPE_GR = "GLIDE_RECORD";
RAGResponseGeneratorConstants.DOCUMENT_TYPE_ATTACHMENT = "ATTACHMENT";
RAGResponseGeneratorConstants.DOCUMENT_TYPE_EXTERNAL = "EXTERNAL_DOCUMENT";
RAGResponseGeneratorConstants.ADDITIONAL_SOURCES_GROUP_ID = "f6c17b15ffe00310f542ffffffffffd0";
RAGResponseGeneratorConstants.DEFAULT_HYBRID_SEMANTIC_SEARCH_CONFIGURATION_SYS_ID = "6b2c447ab7332210e33df89f9e11a931";
