var TopicPathTranslationsUtilSNC = Class.create();
TopicPathTranslationsUtilSNC.prototype = {
    initialize: function() {
        this.activeLanguages = this._getActiveLanguages();
        this.delimiter = " / ";
        this.scheduledJobLastRunProp = "taxonomy.topic_path_translations_job_last_run";
    },

    _getActiveLanguages: function() {
        var activeLanguages = [];
        var languageGr = new GlideRecord("sys_language");
        languageGr.addActiveQuery();
        languageGr.query();
        while (languageGr.next()) {
            var langCode = languageGr.getValue("id");
            if (langCode === "en") continue;
            activeLanguages.push(langCode);
        }
        return activeLanguages;
    },

    // Generate topic path translations for all active taxonomies mapped to a portal
    generateTopicPathTranslations: function() {
        var taxonomyIds = this._getTaxonomies();
        if (taxonomyIds.length === 0) {
            this._updateLastRunSystemProperty();
            return;
        }
        var lastRunTimestamp = gs.getProperty(this.scheduledJobLastRunProp, "");
        var isInitialRun = gs.nil(lastRunTimestamp);
        if (isInitialRun) {
            for (var i = 0; i < taxonomyIds.length; i++) {
                this._generateTopicPathTranslationsForTaxonomy(taxonomyIds[i], {}, true);
            }
        } else {
            var changedTopicNameMap = this._getChangedTopicNameMap(lastRunTimestamp);
            if (changedTopicNameMap && Object.keys(changedTopicNameMap).length > 0) {
                for (var i = 0; i < taxonomyIds.length; i++) {
                    this._generateTopicPathTranslationsForTaxonomy(taxonomyIds[i], changedTopicNameMap, false);
                }
            }
        }
        this._updateLastRunSystemProperty();
    },

    _getTaxonomies: function() {
        var taxonomyIdSet = {};
        var taxonomyPortalMappingGr = new GlideRecord("m2m_sp_portal_taxonomy");
        taxonomyPortalMappingGr.addActiveQuery();
        taxonomyPortalMappingGr.addQuery("taxonomy.active", "true");
        taxonomyPortalMappingGr.query();
        while (taxonomyPortalMappingGr.next()) {
            taxonomyIdSet[taxonomyPortalMappingGr.getValue("taxonomy")] = true;
        }
        return Object.keys(taxonomyIdSet);
    },

    _generateTopicPathTranslationsForTaxonomy: function(taxonomyId, changedTopicNameMap, isInitialRun) {
        var context = null;
        var visitedTopics = {};

        if (isInitialRun) {
            context = this._getContext(taxonomyId);
            var rootTopicIds = context.parentToChildMap[""] || [];
            var langMap = {};
            for (var lang of this.activeLanguages) {
                langMap[lang] = true;
            }

            for (var i = 0; i < rootTopicIds.length; i++) {
                this._traverseAndUpsertTopicPaths(rootTopicIds[i], context, {}, langMap, visitedTopics);
            }
        } else {
            var changedTopicMapForTaxonomy = this._getChangedTopicsForTaxonomy(taxonomyId, changedTopicNameMap);
            if (Object.keys(changedTopicMapForTaxonomy).length === 0) return;
            context = this._getContext(taxonomyId);
            var levelWiseChangedTopics = this._getLevelWiseChangedTopics(changedTopicMapForTaxonomy, context.topicMap);
            for (var level in levelWiseChangedTopics) {
                for (var topic in levelWiseChangedTopics[level]) {
                    if (!visitedTopics[topic]) {
                        this._traverseAndUpsertTopicPaths(topic, context, changedTopicMapForTaxonomy, {}, visitedTopics);
                    }
                }
            }

        }
    },

    _getChangedTopicsForTaxonomy: function(taxonomyId, changedTopicNameMap) {
        var changedTopicMapForTaxonomy = {};
        var changedTopicIds = Object.keys(changedTopicNameMap || {});
        if (changedTopicIds.length === 0) return changedTopicMapForTaxonomy;
        var topicGr = new GlideRecord('topic');
        topicGr.addQuery('sys_id', 'IN', changedTopicIds.join(','));
        topicGr.addQuery('taxonomy', taxonomyId);
        topicGr.query();
        while (topicGr.next()) {
            var id = topicGr.getValue('sys_id');
            changedTopicMapForTaxonomy[id] = changedTopicNameMap[id];
        }
        return changedTopicMapForTaxonomy;
    },

    _getContext: function(taxonomyId) {
        var {
            topicMap,
            parentToChildMap
        } = this._fetchTopics(taxonomyId);
        var topicNameTranslationsMap = this._fetchTopicTranslations(Object.keys(topicMap), "name");
        var topicPathTranslationsMap = this._fetchTopicTranslations(Object.keys(topicMap), "topic_path");

        return {
            topicMap: topicMap,
            parentToChildMap: parentToChildMap,
            topicNameTranslationsMap: topicNameTranslationsMap,
            topicPathTranslationsMap: topicPathTranslationsMap
        };
    },

    _fetchTopics: function(taxonomyId) {
        var topics = {};
        var parentToChildMap = {};
        var topicGr = new GlideRecord("topic");
        topicGr.addActiveQuery();
        topicGr.addQuery("taxonomy", taxonomyId);
        topicGr.query();
        while (topicGr.next()) {
            var topicId = topicGr.getUniqueValue();
            var parentId = topicGr.getValue("parent_topic") || "";
            var topicPath = topicGr.getValue("topic_path") || "";
            var level = topicPath.split(this.delimiter).length - 1;
            topics[topicId] = {
                id: topicId,
                level: level,
                parentId: parentId,
                name: topicGr.getValue("name"),
                topicPath: topicPath
            };
            if (!parentToChildMap[parentId]) parentToChildMap[parentId] = [];
            parentToChildMap[parentId].push(topicId);
        }

        return {
            topicMap: topics,
            parentToChildMap: parentToChildMap
        };
    },

    _fetchTopicTranslations: function(topicIds, fieldName) {
        var translations = {};
        if (!topicIds.length) return translations;
        var gr = new GlideRecord("sys_translated_text");
        gr.addQuery("tablename", "topic");
        gr.addQuery("fieldname", fieldName);
        gr.addQuery("documentkey", "IN", topicIds.join(","));
        gr.query();
        while (gr.next()) {
            var topicId = gr.getValue("documentkey");
            var lang = gr.getValue("language");
            var value = gr.getValue("value");
            if (!translations[topicId]) translations[topicId] = {};
            translations[topicId][lang] = value;
        }
        return translations;
    },

    _getChangedTopicNameMap: function(timestamp) {
        var changedTopicNameMap = {};
        var translationGr = new GlideRecord("sys_translated_text");
        translationGr.addQuery("tablename", "topic");
        translationGr.addQuery("fieldname", "name");
        translationGr.addQuery("language", "IN", this.activeLanguages.join(","));
        translationGr.addQuery("sys_updated_on", ">=", timestamp);
        translationGr.query();
        while (translationGr.next()) {
            var topicId = translationGr.getValue("documentkey");
            var lang = translationGr.getValue("language");
            if (!changedTopicNameMap[topicId]) changedTopicNameMap[topicId] = {};
            changedTopicNameMap[topicId][lang] = true;
        }
        return changedTopicNameMap;
    },

    _getLevelWiseChangedTopics: function(changedTopicNameMap, topicMap) {
        var levelWiseChangedTopics = {};
        var levels = [];
        for (var topic in changedTopicNameMap) {
            if (!topicMap[topic]) continue;
            var level = topicMap[topic].level;
            if (!levelWiseChangedTopics[level]) {
                levelWiseChangedTopics[level] = {};
                levels.push(level);
            }
            levelWiseChangedTopics[level][topic] = changedTopicNameMap[topic];
        }
        // Sort levels in the ascending order
        levels.sort(function(a, b) {
            return a - b;
        });
        var sorted = {};
        for (var i = 0; i < levels.length; i++) {
            sorted[levels[i]] = levelWiseChangedTopics[levels[i]];
        }
        return sorted;
    },

    _traverseAndUpsertTopicPaths: function(topicId, context, changedTopicNameMap, parentAffectedLanguages, visitedTopics) {
        if (!context.topicMap[topicId] || visitedTopics[topicId]) return;
        visitedTopics[topicId] = true;

        var parentLangObj = parentAffectedLanguages || {};
        var nodeLangObj = changedTopicNameMap[topicId] || {};
        var affectedLangSet = Object.assign({}, parentLangObj, nodeLangObj);
        var affectedLangs = Object.keys(affectedLangSet);
        if (affectedLangs.length === 0) return;

        var topic = context.topicMap[topicId];
        var parentId = context.topicMap[topicId].parentId;
        var parentTopic = parentId ? context.topicMap[parentId] : {};
        var parentTopicPaths = context.topicPathTranslationsMap[parentId] || {};
        var currTopicPaths = context.topicPathTranslationsMap[topicId] || {};
        var topicNameTranslations = context.topicNameTranslationsMap[topicId] || {};
        var topicPathByLang = {};
        for (var lang of affectedLangs) {
            var parentPath = parentTopicPaths[lang] || parentTopic.topicPath || "";
            var translatedName = topicNameTranslations[lang] || topic.name;
            var topicPath = parentPath ? parentPath + this.delimiter + translatedName : translatedName;
            currTopicPaths[lang] = topicPath;
            topicPathByLang[lang] = topicPath;
        }
        context.topicPathTranslationsMap[topicId] = currTopicPaths;
        this._upsertTopicPathTranslations(topicId, topicPathByLang);
        var children = context.parentToChildMap[topicId] || [];
        for (var i = 0; i < children.length; i++) {
            this._traverseAndUpsertTopicPaths(children[i], context, changedTopicNameMap, affectedLangSet, visitedTopics);
        }
    },

    _upsertTopicPathTranslations: function(topicId, topicPathByLang) {
        var affectedLanguages = Object.keys(topicPathByLang);
        var updatedLanguages = {};
        var translationGr = new GlideRecord("sys_translated_text");
        translationGr.addQuery("tablename", "topic");
        translationGr.addQuery("documentkey", topicId);
        translationGr.addQuery("fieldname", "topic_path");
        translationGr.addQuery("language", "IN", affectedLanguages.join(","));
        translationGr.query();
        while (translationGr.next()) {
            var lang = translationGr.getValue("language");
            var value = topicPathByLang[lang];
            if (!gs.nil(value)) {
                if (translationGr.getValue("value") !== value) {
                    translationGr.setValue("value", value);
                    translationGr.update();
                }
                updatedLanguages[lang] = true;
            }
        }

        // Insert missing topic path translations
        for (var lang of affectedLanguages) {
            var value = topicPathByLang[lang];
            if (!updatedLanguages[lang] && !gs.nil(value)) {
                var newTranslationGr = new GlideRecord("sys_translated_text");
                newTranslationGr.initialize();
                newTranslationGr.setValue("tablename", "topic");
                newTranslationGr.setValue("documentkey", topicId);
                newTranslationGr.setValue("fieldname", "topic_path");
                newTranslationGr.setValue("language", lang);
                newTranslationGr.setValue("value", value);
                newTranslationGr.insert();
            }
        }
    },

    _updateLastRunSystemProperty: function() {
        gs.setProperty(this.scheduledJobLastRunProp, new GlideDateTime());
    },

    // Updates topic_path translations for topic and its entire subtree.
    handleTopicPathTranslationsForSubtree: function(topicId, taxonomyId, parentChanged, nameChanged, sessionLang) {
        var baseLang = 'en';
        var lang = sessionLang || gs.getSession().getLanguage();

        if (nameChanged && !parentChanged) {
            if (lang === baseLang) {
                this._updateBaseTopicPathsForSubtree(topicId);
            } else {
                var changedTopicNameMap = {};
                var affectedLangs = {};
                affectedLangs[lang] = true;
                changedTopicNameMap[topicId] = affectedLangs;
                this._generateTopicPathTranslationsForTaxonomy(taxonomyId, changedTopicNameMap, false);
            }
            return;
        }
        var affectedLangsAll = {};
        var activeLanguages = this.activeLanguages;
        for (var i = 0, len = activeLanguages.length; i < len; i++) {
            affectedLangsAll[activeLanguages[i]] = true;
        }
        var changedTopicNameMapAll = {};
        changedTopicNameMapAll[topicId] = affectedLangsAll;
        this._updateBaseTopicPathsForSubtree(topicId);
        this._generateTopicPathTranslationsForTaxonomy(taxonomyId, changedTopicNameMapAll, false);
    },

    _getSubtreeDataBFS: function(rootTopicId) {
        var topicFields = {};
        var ids = [];
        if (gs.nil(rootTopicId)) return {
            ids: ids,
            topicFields: topicFields
        };
        var visited = {};
        this._traverseLevelBFSWithData([rootTopicId], visited, ids, topicFields);
        return {
            ids: ids,
            topicFields: topicFields
        };
    },

    _traverseLevelBFSWithData: function(levelIds, visited, ids, topicFields) {
        if (!levelIds || levelIds.length === 0) return;
        var nextLevel = [];
        var len = levelIds.length;
        for (var i = 0; i < len; i++) {
            var currentId = levelIds[i];
            if (visited[currentId]) continue;
            visited[currentId] = true;
            ids.push(currentId);
            var topicGr = new GlideRecord('topic');

            if (topicGr.get(currentId)) {
                topicFields[currentId] = {
                    name: topicGr.getValue('name'),
                    parentId: topicGr.getValue('parent_topic'),
                    basePath: topicGr.getValue('topic_path') || ''
                };
                var childGr = new GlideRecord('topic');
                childGr.addQuery('parent_topic', currentId);
                childGr.query();
                while (childGr.next()) {
                    var childId = childGr.getUniqueValue();
                    if (!visited[childId]) nextLevel.push(childId);
                }
            }
        }
        this._traverseLevelBFSWithData(nextLevel, visited, ids, topicFields);
    },

    _updateBaseTopicPathsForSubtree: function(rootTopicId) {
        if (gs.nil(rootTopicId)) return;
        var result = this._getSubtreeDataBFS(rootTopicId);
        var ids = result.ids;
        var topicFields = result.topicFields;
        var updatedBasePathById = {};
        var delimiter = this.delimiter; // Cache delimiter access

        for (var k = 0, idsLen = ids.length; k < idsLen; k++) {
            var id = ids[k];
            var topicField = topicFields[id];
            var baseName = (topicField && topicField.name) || '';
            var parentPath = '';
            var parentId = topicField ? topicField.parentId : '';

            if (!gs.nil(parentId)) {
                var cachedParent = updatedBasePathById[parentId];
                if (gs.nil(cachedParent)) {
                    var parentField = topicFields[parentId];
                    cachedParent = (parentField && parentField.basePath) || '';
                    if (gs.nil(cachedParent)) {
                        var parentGr = new GlideRecord('topic');
                        if (parentGr.get(parentId)) {
                            cachedParent = parentGr.getValue('topic_path') || '';
                        }
                    }
                }
                parentPath = cachedParent || '';
            }

            var newPath = parentPath ? (parentPath + delimiter + baseName) : baseName;
            var currentBase = (topicField && topicField.basePath) || '';

            if (currentBase !== newPath) {
                var topicGr = new GlideRecord('topic');
                if (topicGr.get(id)) {
                    topicGr.setValue('topic_path', newPath);
                    topicGr.update();
                }
                if (topicField) topicField.basePath = newPath;
            }
            updatedBasePathById[id] = newPath;
        }
    },
    type: 'TopicPathTranslationsUtilSNC'
};
