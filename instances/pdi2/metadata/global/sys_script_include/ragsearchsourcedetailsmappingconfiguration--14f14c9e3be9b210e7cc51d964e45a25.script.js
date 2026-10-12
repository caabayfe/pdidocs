var RAGSearchSourceDetailsMappingConfiguration = Class.create();
    RAGSearchSourceDetailsMappingConfiguration.prototype = {
        initialize: function() {},

        type: 'RAGSearchSourceDetailsMappingConfiguration'
    };

    RAGSearchSourceDetailsMappingConfiguration.KB_SOURCE_MAPPING = {
        sourceTableName: 'kb_knowledge',
        fieldsToFetch: ['short_description', 'text'],
        addChunkingFormat: true
    };

    RAGSearchSourceDetailsMappingConfiguration.CATALOG_SOURCE_MAPPING = {
        sourceTableName: 'sc_cat_item',
        fieldsToFetch: ['name', 'description', 'cc_render_type'],
        addChunkingFormat: false
    };

    RAGSearchSourceDetailsMappingConfiguration.SKILL_SOURCE_MAPPING = {
        sourceTableName: 'sys_gen_ai_skill',
        fieldsToFetch: ['skill_name', 'skill_description'],
        addChunkingFormat: false
    };

    RAGSearchSourceDetailsMappingConfiguration.EXTERNAL_CONTENT_SOURCE_MAPPING = {
        fieldsToFetch: ['source_url'],
        addChunkingFormat: true
    };
