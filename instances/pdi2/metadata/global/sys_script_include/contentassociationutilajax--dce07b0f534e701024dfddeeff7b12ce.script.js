var ContentAssociationUtilAjax = Class.create();
ContentAssociationUtilAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    _getOutdatedContentCondition: function(contentType) {
        var taxonomyConfigGr = new GlideRecord('taxonomy_content_configuration');
        taxonomyConfigGr.get(contentType);
        var condition = taxonomyConfigGr.getValue('conditions');
        return condition;
    },

    _isValidCondition: function(condition) {
        var m2mGr = new GlideRecord('m2m_connected_content');
        return !!(condition && m2mGr.isValidEncodedQuery(condition));
    },

    //Get and return a list of categories (name and sys_id)
    getCategories: function() {
        var categoryField = this.getParameter('sysparm_table');
        var text = (categoryField == 'sc_category' ? 'title' : 'label');
        var gr = new GlideRecord(categoryField);
        gr.orderBy(text);
        gr.addQuery('active', true);
        gr.query();

        while (gr.next()) {
            if (gr.canRead()) {
                var item = this.newItem();
                item.setAttribute('value', gr.getValue('sys_id'));
                var textValue = gr.getDisplayValue(text);
                if (categoryField == 'sc_category' && gr.getDisplayValue('sc_catalog') != '')
                    textValue = textValue + ' (' + gr.getDisplayValue('sc_catalog') + ')';
                else if (categoryField == 'kb_category' && gr.getDisplayValue('parent_id') != '')
                    textValue = textValue + ' (' + gr.getDisplayValue('parent_id') + ')';
                item.setAttribute('text', textValue);
            }
        }
    },

    //Get and return a list of categories (name and sys_id)
    getUnAssociatedCategories: function() {
        var categoryField = this.getParameter('sysparm_table');
        var topicId = this.getParameter('sysparm_topic');
        var contentType = this.getParameter('sysparm_content_type');
        var contentTable = this.getParameter('sysparm_content_table');


        var categoryFieldMap = this._getApproriateCategoryFieldsMap(contentTable);

        var categoryGr = new GlideRecord('m2m_connected_category');
        categoryGr.addActiveQuery();
        categoryGr.addQuery('content_type', contentType);
        categoryGr.addQuery('topic', topicId);
        categoryGr.query();

        var associatedCategories = [];
        while (categoryGr.next()) {
            associatedCategories.push(categoryGr.getElement(categoryField).sys_id);
        }

        var gr = new GlideRecord(categoryField);
        gr.addQuery('sys_id', 'NOT IN', associatedCategories);
        gr.addQuery('active', true);
        gr.orderBy(categoryFieldMap['categoryLabel']);
        gr.query();

        while (gr.next()) {
            if (gr.canRead()) {
                var currentSysId = gr.getValue('sys_id');
                var item = this.newItem();
                item.setAttribute('value', currentSysId);
                var textValue = gr.getDisplayValue(categoryFieldMap['categoryLabel']);

                var parent = gr.getDisplayValue(categoryFieldMap['categoryParent']);
                if (parent && parent != '')
                    textValue = textValue + ' (' + parent + ')';

                item.setAttribute('text', textValue);

            }
        }
    },

    //Get associated categories to topic
    getAssociatedCategories: function() {
        var topic = this.getParameter('sysparm_topic');
        var contentType = this.getParameter('sysparm_content_type');
        var contentTable = this.getParameter('sysparm_content_table');

        var categoryFieldMap = this._getApproriateCategoryFieldsMap(contentTable);

        var gr = new GlideRecord('m2m_connected_category');
        gr.addActiveQuery();
        gr.addQuery('content_type', contentType);
        gr.addQuery('topic', topic);
        gr.orderBy(categoryFieldMap['categoryColumn'] + '.' + categoryFieldMap['categoryLabel']);
        gr.query();

        while (gr.next()) {
            var categoryId = gr.getElement(categoryFieldMap['categoryColumn']).sys_id;

            var item = this.newItem();
            item.setAttribute('value', categoryId);
            var textValue = gr.getDisplayValue(categoryFieldMap['categoryColumn']);
            var parent = gr.getDisplayValue(categoryFieldMap['categoryColumn'] + '.' + categoryFieldMap['categoryParent']);
            if (parent && parent != '')
                textValue = textValue + ' (' + parent + ')';
            item.setAttribute('text', textValue);
        }
    },


    fireAssociationEvent: function() {
        var topicId = this.getParameter('sysparm_topic');
        var categoryField = this.getParameter('sysparm_table');
        var categories = this.getParameter('sysparm_values');
        var gr = new GlideRecordSecure('topic');
        gr.get(topicId);
        gs.eventQueue("topic.content_association", gr, categoryField, categories);
    },

    fireDisassociationEvent: function() {
        var topicId = this.getParameter('sysparm_topic');
        var categories = this.getParameter('sysparm_values');
        var categoryField = this.getParameter('sysparm_table');
        categoryField = categoryField + ',disAssociation';
        var gr = new GlideRecordSecure('topic');
        gr.get(topicId);
        gs.eventQueue("topic.content_association", gr, categoryField, categories);
    },

    getCategoryTypes: function() {
        var gr = new GlideRecord('taxonomy_content_configuration');
        gr.addQuery('active', true);
        gr.query();
        while (gr.next()) {
            if (!gs.nil(gr.getValue('category_reference_field'))) {
                var item = this.newItem();
                item.setAttribute('cat_value', gr.getValue('sys_id'));
                item.setAttribute('name', gr.getDisplayValue('name'));
                item.setAttribute('cat_table', gr.getValue('category_reference_field'));
                item.setAttribute('content_table', gr.getValue('content_table'));
            }
        }
    },

    disassociateKnowledgeFromTopic: function(topicId, categoryList) {

        //Get list of knowledge to delete
        var kbGr = new GlideRecord('kb_knowledge');
        kbGr.addQuery('kb_category', 'IN', categoryList);
        kbGr.query();
        var kbList = [];
        while (kbGr.next())
            kbList.push(kbGr.getValue('sys_id'));

        //Delete knowledge from m2m_connected_content
        var m2mGr = new GlideRecord('m2m_connected_content');
        m2mGr.addQuery('knowledge', 'IN', kbList);
        m2mGr.addQuery('topic', topicId);
        m2mGr.addQuery('source', 'category');
        m2mGr.query();
        m2mGr.deleteMultiple();


        //Delete categry topic association from m2m_connected_category
        var m2mCategoryGr = new GlideRecord('m2m_connected_category');
        m2mCategoryGr.addQuery('kb_category', 'IN', categoryList);
        m2mCategoryGr.addQuery('topic', topicId);
        m2mCategoryGr.setWorkflow(false);
        m2mCategoryGr.query();
        m2mCategoryGr.deleteMultiple();

        this._deleteUnconnectedRecords(topicId, 'kb_category', categoryList);
    },

    disassociateCatalogsFromTopic: function(topicId, categoryList) {

        //To get list of catalog items from given category list
        var catalogs = [];
        var catGr = new GlideRecord('sc_cat_item_category');
        catGr.addQuery('sc_category', 'IN', categoryList);
        catGr.query();
        while (catGr.next())
            catalogs.push(catGr.getValue('sc_cat_item'));

        //To get map of catalog items with corresponding category array
        var categoryCatalogMap = {};
        var catGr2 = new GlideRecord('sc_cat_item_category');
        catGr2.addQuery('sc_cat_item', 'IN', catalogs);
        catGr2.query();
        while (catGr2.next()) {
            var catalog = catGr2.getValue('sc_cat_item');
            if (!(catalog in categoryCatalogMap))
                categoryCatalogMap[catalog] = [];
            categoryCatalogMap[catalog].push((catGr2.getValue('sc_category')).toString());
        }

        var catalogsList = Object.keys(categoryCatalogMap);

        //If a catalog item is associated with only one catalog category delete from m2m_connected_content
        catalogsList.forEach(function(catItem) {
            if (categoryCatalogMap[catItem].length === 1) {
                var m2mGr = new GlideRecord('m2m_connected_content');
                m2mGr.addQuery('catalog_item', catItem);
                m2mGr.addQuery('topic', topicId);
                m2mGr.addQuery('source', 'category');
                m2mGr.query();
                m2mGr.deleteMultiple();
            }
        });

        //Get list of associated categories that are not in the current input list
        var associatedCategoryList = [];
        var connectedGr = new GlideRecord('m2m_connected_category');
        connectedGr.addQuery('topic', topicId);
        connectedGr.addQuery('sc_category', 'NOT IN', categoryList);
        connectedGr.query();
        while (connectedGr.next())
            associatedCategoryList.push((connectedGr.getValue('sc_category')).toString());

        catalogsList.forEach(function(catItem) {
            var values = categoryCatalogMap[catItem];
            if (values.length > 1) {
                /*When a catalog item is associated with more than one catalog category
                    And all of them are in input category list delete from m2m_connected_content*/
                if (values.every(function(value) {
                        return categoryList.indexOf(value) > -1;
                    })) {
                    var m2mConnectedGr = new GlideRecord('m2m_connected_content');
                    m2mConnectedGr.addQuery('topic', topicId);
                    m2mConnectedGr.addQuery('catalog_item', catItem);
                    m2mConnectedGr.addQuery('source', 'category');
                    m2mConnectedGr.query();
                    m2mConnectedGr.deleteMultiple();
                } else {
                    //Get catalog categories of a catalog item that are not in input category list
                    var remainingCategories = values.filter(
                        function(el) {
                            return categoryList.indexOf(el) < 0;
                        }
                    );

                    /*When a catalog item is associated with more than one catalog category
                     * if catalog categories of catalog item that are not in input category list are also not in associated category list 
                     * delete from m2m_connected_content*/
                    if (remainingCategories && remainingCategories.length > 0 && !remainingCategories.some(function(value) {
                            return associatedCategoryList.indexOf(value) > -1;
                        })) {
                        m2mConnectedGr = new GlideRecord('m2m_connected_content');
                        m2mConnectedGr.addQuery('topic', topicId);
                        m2mConnectedGr.addQuery('catalog_item', catItem);
                        m2mConnectedGr.addQuery('source', 'category');
                        m2mConnectedGr.query();
                        m2mConnectedGr.deleteMultiple();
                    }
                }
            }
        });

        //Delete category topic association from m2m_connected_category
        var m2mCategoryGr = new GlideRecord('m2m_connected_category');
        m2mCategoryGr.addQuery('sc_category', 'IN', categoryList);
        m2mCategoryGr.addQuery('topic', topicId);
        m2mCategoryGr.setWorkflow(false);
        m2mCategoryGr.query();
        m2mCategoryGr.deleteMultiple();

        this._deleteUnconnectedRecords(topicId, 'sc_category', categoryList);
    },

    _getApproriateCategoryFieldsMap: function(contentTable) {
        var extensions = new GlideScriptedExtensionPoint().getExtensions('TaxonomyContentProcessor');
        var categoryFieldMap = {};
        for (var i = 0; i < extensions.length; i++) {
            if (extensions[i].getTableName() == contentTable) {
                categoryFieldMap = extensions[i].getCategoryFieldsMap();
                break;
            }
        }
        return categoryFieldMap;
    },

    /**
     * Creates connected content records for all the knowledge articles under given categorieList
     **/
    associateKnowledgeToTopic: function(topicId, categoryField, categoryList) {
        var m2mGr = new GlideRecord('m2m_connected_content');
        var knowledgeContentType = '4c32a92153622010069addeeff7b12a3';
        if (!m2mGr.canWrite()) {
            gs.info(gs.getMessage("User {0} does not have create access on Connected Content table", [gs.getUserID()]));
            return;
        }

        var i = 0,
            len = categoryList.length;
        while (i < len) {
            var gr = new GlideRecord('m2m_connected_category');
            gr.initialize();
            gr.setValue('content_type', knowledgeContentType);
            gr.setValue('kb_category', categoryList[i]);
            gr.setValue('topic', topicId);
            gr.insert();
            i++;
        }

        var outdatedCondition = this._getOutdatedContentCondition(knowledgeContentType);
        var filterOutdatedContent = this._isValidCondition(outdatedCondition);

        var kbGr = new GlideRecord('kb_knowledge');
        kbGr.addQuery(categoryField, categoryList);
        kbGr.query();
        while (kbGr.next()) {
            m2mGr = new GlideRecord('m2m_connected_content');
            m2mGr.initialize();
            m2mGr.setValue('content_type', knowledgeContentType);
            m2mGr.setValue('knowledge', kbGr.getUniqueValue());
            m2mGr.setValue('topic', topicId);
            m2mGr.setValue('source', 'category');
            if (!filterOutdatedContent || (!GlideFilter.checkRecord(m2mGr, outdatedCondition))) {
                m2mGr.insert();
            }
        }
    },

    /**
     * Creates connected content records for all the catalog items under given categorieList
     **/
    associateCatalogToTopic: function(topicId, categoryField, categoryList) {
        var m2mGr = new GlideRecord('m2m_connected_content');
        var catalogContentType = '98f9a16553622010069addeeff7b1248';
        if (!m2mGr.canWrite()) {
            gs.info(gs.getMessage("User {0} does not have create access on Connected Content table", [gs.getUserID()]));
            return;
        }

        var i = 0,
            len = categoryList.length;
        while (i < len) {
            var gr = new GlideRecord('m2m_connected_category');
            gr.initialize();
            gr.setValue('content_type', catalogContentType);
            gr.setValue('sc_category', categoryList[i]);
            gr.setValue('topic', topicId);
            gr.insert();
            i++;
        }
        var outdatedCondition = this._getOutdatedContentCondition(catalogContentType);
        var filterOutdatedContent = this._isValidCondition(outdatedCondition);

        var catGr = new GlideRecord('sc_cat_item_category');
        catGr.addQuery(categoryField, categoryList);
        catGr.query();
        while (catGr.next()) {
            var catItemGr = catGr.sc_cat_item.getRefRecord();
            if (catItemGr.isValidRecord()) {
                m2mGr = new GlideRecord('m2m_connected_content');
                m2mGr.initialize();
                m2mGr.setValue('content_type', catalogContentType);
                m2mGr.setValue('catalog_item', catGr.getValue('sc_cat_item'));
                m2mGr.setValue('topic', topicId);
                m2mGr.setValue('source', 'category');
                if (!filterOutdatedContent || (!GlideFilter.checkRecord(m2mGr, outdatedCondition))) {
                    m2mGr.insert();
                }
            }
        }
    },

    _deleteUnconnectedRecords: function(topicId, categoryField, categoryList) {
        var unconnContentGr = new GlideRecord("unconnected_category_content");
        unconnContentGr.addQuery("topic", topicId);
        unconnContentGr.addQuery(categoryField, categoryList);
        unconnContentGr.query();
        unconnContentGr.deleteMultiple();
    },

    type: 'ContentAssociationUtilAjax'
});
