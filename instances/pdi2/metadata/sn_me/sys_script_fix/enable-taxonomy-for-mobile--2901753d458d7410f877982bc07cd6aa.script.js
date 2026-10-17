/**
 * This script makes 5 changes.
 * 1. Removes 'Category is not empty' condition from AIS search source filter for catalogs
 * 2. Replaces the mapping betwen 'Services' Zing search source and 'NowMobile App Search Configurations' with a mapping between 'Services' Zing search source present in Now Mobile scope and 'NowMobile App Search Configurations'.
 * 3. Replaces the mapping betwen 'Articles' Zing search source and 'NowMobile App Search Configurations' with a mapping between 'Articles' Zing search source present in Now Mobile scope and 'NowMobile App Search Configurations'.
 * 4. Replace the 'category' field from card element attribute for Search Result Service Catalog with 'taxonomy_topic'.
 * 5. Replace the 'kb_category' field from card element attribute for Knowledge AIS search result with 'taxonomy_topic'.
 **/

var runManually = false; // Update this to true to run manually (forced updation even on customised records)

var EMPLOYEE_TAXONOMY = '1f5d5a40c3203010069aec4b7d40dd93';
var MESP = '26f2fffb77322300454792718a1061e5';
var M2M_NOWMOBILE_SEARCHCONFIG_SERVICES = '7351749673032300c342d5fdbdf6a750';
var ZING_SEARCH_SOURCE_TAXONOMY_SERVICES = '336ab1c5c7313010fedf0bcbe2c2601f';
var M2M_NOWMOBILE_SEARCHCONFIG_ARTICLES = '0a51749673032300c342d5fdbdf6a75a';
var ZING_SEARCH_SOURCE_TAXONOMY_ARTICLES = '2b6cc681c7713010fedf0bcbe2c2606c';
var CATALOG_CARD_ELEMENT_ATTRIBUTE = 'c46814af53231010f1c8ddeeff7b1267';
var KNOWLEDGE_CARD_ELEMENT_ATTRIBUTE = 'd4488f0474b71010f877de4112351625';

var taxonomySysPropRecord = new GlideRecord('sys_properties');
taxonomySysPropRecord.addQuery('name','sn_me.taxonomy_enabled');
taxonomySysPropRecord.setLimit(1);
taxonomySysPropRecord.query();
var isTaxonomyEnabled = (taxonomySysPropRecord.next() && taxonomySysPropRecord.getValue('value') === 'true') ? true : false;

if (isTaxonomyEnabled) {
    gs.info(gs.getMessage("Enabling taxonomy portal and search configurations for mobile"));
    new sn_scmobile.MobileCatalogUtil().removeCategoryFilterCondition(runManually);
    this.updateCatlaogZingSearch();
    this.updateKnowledgeZingSearch();
    this.updateCatalogCardElementAttribute();
    this.updateKnowledgeCardElementAttribute();
} else
    gs.info(gs.getMessage("Taxonomy for mobile is not enabled, please run the fix script manually after setting the property 'sn_me.taxonomy_enabled' to true"));

function updateCatlaogZingSearch() {
    var gr = new GlideRecord('m2m_search_context_config_search_source');
    if (!gr.canWrite()) {
        gs.info(gs.getMessage("User {0} does not have write access to 'm2m_search_context_config_search_source' table.", [gs.getUserID()]));
        return;
    }
    if (gr.get(M2M_NOWMOBILE_SEARCHCONFIG_SERVICES)) {
        if (!this.isCustomised('m2m_search_context_config_search_source_' + M2M_NOWMOBILE_SEARCHCONFIG_SERVICES) || runManually) {
            gr.setValue('source', ZING_SEARCH_SOURCE_TAXONOMY_SERVICES);
            gr.update();
        }
    } else
        gs.info(gs.getMessage("Enable Taxonomy for Mobile: Mapping between 'NowMobile App Search Configurations' and 'Services' search source not found"));
}

function updateKnowledgeZingSearch() {
    var gr = new GlideRecord('m2m_search_context_config_search_source');
    if (!gr.canWrite())
        return;
    if (gr.get(M2M_NOWMOBILE_SEARCHCONFIG_ARTICLES)) {
        if (!this.isCustomised('m2m_search_context_config_search_source_' + M2M_NOWMOBILE_SEARCHCONFIG_ARTICLES) || runManually) {
            gr.setValue('source', ZING_SEARCH_SOURCE_TAXONOMY_ARTICLES);
            gr.update();
        }
    } else
        gs.info(gs.getMessage("Enable Taxonomy for Mobile: Mapping between 'NowMobile App Search Configurations' and 'Articles' search source not found"));
}

function updateCatalogCardElementAttribute() {
    var gr = new GlideRecord('sys_sg_view_config_element_attribute');
    if (!gr.canWrite())
        return;
    if (gr.get(CATALOG_CARD_ELEMENT_ATTRIBUTE)) {
        if (!this.isCustomised('sys_sg_view_config_element_attribute_' + CATALOG_CARD_ELEMENT_ATTRIBUTE) || runManually) {
            gr.setValue('value', 'taxonomy_topic');
            gr.update();
        }
    } else
        gs.info(gs.getMessage("Enable Taxonomy for Mobile: Card Element attribute for Catalog Search Item Category not found"));
}

function updateKnowledgeCardElementAttribute() {
    var gr = new GlideRecord('sys_sg_view_config_element_attribute');
    if (!gr.canWrite())
        return;
    if (gr.get(KNOWLEDGE_CARD_ELEMENT_ATTRIBUTE)) {
        if (!this.isCustomised('sys_sg_view_config_element_attribute_' + KNOWLEDGE_CARD_ELEMENT_ATTRIBUTE) || runManually) {
            gr.setValue('value', 'taxonomy_topic');
            gr.update();
        }
    } else
        gs.info(gs.getMessage("Enable Taxonomy for Mobile: Card Element attribute for Knowledge AIS search result category not found"));
}

function isCustomised(name) {
    var updateGr = new GlideRecord('sys_update_xml');
    updateGr.addQuery('name', name);
    updateGr.setLimit(1);
    updateGr.query();
    return updateGr.hasNext();
}
