var TaxonomyConstants = Class.create();

TaxonomyConstants.CONTENT_SCRIPTED_EXTENSION_POINT = 'global.TaxonomyContentProcessor';
TaxonomyConstants.TOPIC_MAX_LEVEL = 'taxonomy.topic.max_level';

TaxonomyConstants.getContentReferenceFields = function() {
    var contentReferenceFields = [];
    var gr = new GlideRecord("taxonomy_content_configuration");
    gr.addActiveQuery();
    gr.query();
    while (gr.next()) {
        contentReferenceFields.push(gr.getValue("content_reference_field"));
    }
    return contentReferenceFields;
};

TaxonomyConstants.getCategoryReferenceFields = function() {
    var contentReferenceFields = [];
    var gr = new GlideRecord("taxonomy_content_configuration");
    gr.addActiveQuery();
	gr.addNotNullQuery("category_reference_field");
    gr.query();
    while (gr.next()) {
        contentReferenceFields.push(gr.getValue("category_reference_field"));
    }
    return contentReferenceFields;
};

TaxonomyConstants.CONTENT_REFERENCE_FIELDS = TaxonomyConstants.getContentReferenceFields();
TaxonomyConstants.CATEGORY_REFERENCE_FIELDS = TaxonomyConstants.getCategoryReferenceFields();

TaxonomyConstants.getTopicMaxLevel = function() {
    var gr = new GlideRecord('sys_properties');
    gr.get('name', TaxonomyConstants.TOPIC_MAX_LEVEL);
    return gr.getValue('value');
};

TaxonomyConstants.TABLES = {
    TAXONOMY_CONTENT_CONFIGURATION: 'taxonomy_content_configuration',
    TAXONOMY_TABLE: 'taxonomy',
    TOPIC_TABLE: 'topic',
    M2M_CONTENT_TABLE: 'm2m_connected_content',
    M2M_CONTRIBUTOR_TABLE: 'm2m_taxonomy_contributor',
    FEATURED_CONTENT_TABLE: 'featured_content',
    M2M_PORTAL_TAXONOMY_TABLE: 'm2m_sp_portal_taxonomy',
    CONTENT_TABLES: new ContentConfigUtil().getContentTables()
};

TaxonomyConstants.prototype = {
    type: 'TaxonomyConstants'
};
