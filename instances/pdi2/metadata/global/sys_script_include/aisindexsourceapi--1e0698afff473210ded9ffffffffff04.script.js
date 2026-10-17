var AISIndexSourceAPI = Class.create();
AISIndexSourceAPI.prototype = {
    MAP_TO_ATTRIBUTE_SYS_ID: 'f734a634c7320010d1cfd9795cc26094',
    NOT_SEARCHABLE_ATTRIBUTE_SYS_ID: '5d84648253302010bca8ddeeff7b127c',
    RETENTION_POLICY_TWO_YEARS: '04f129e57792f010be280d892c5a99d9',

    initialize: function() {},

    //Check if an indexed source exists for a given table
    indexedSourceExists: function(tableName) {
        if (!tableName) return false;

        var childTableGr = new GlideRecord('ais_child_table');
        childTableGr.addQuery('table', tableName);
        childTableGr.query();
        var isChild = childTableGr.next();

        var datasourceGr = new GlideRecord('ais_datasource');
        if (isChild)
            datasourceGr.addQuery('sys_id', childTableGr.datasource);
        else
            datasourceGr.addQuery('source', tableName);
        datasourceGr.setWorkflow(false);
        datasourceGr.query();

        if (datasourceGr.next()) {
            return {
                name: datasourceGr.name.toString(),
                sys_id: datasourceGr.getUniqueValue(),
                active: !!datasourceGr.active,
                filter: datasourceGr.getValue('filter'),
                type: datasourceGr.getValue('type'),
                source: datasourceGr.getValue('source')
            };
        }
        return false;
    },

    //Create a search source and link it to a profile
    createAndlinkSearchSource: function(profile, datasource, name, conditions) {
        if (!profile || !datasource) return false;

        var sourceGr = new GlideRecord('ais_search_source');
        sourceGr.initialize();
        sourceGr.name = name;
        sourceGr.datasource = datasource;
        if (conditions) sourceGr.condition = conditions;
        var sourceId = sourceGr.insert();

        if (!sourceId) return false;

        var m2mGr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
        m2mGr.initialize();
        m2mGr.profile = profile;
        m2mGr.search_source = sourceId;
        if (m2mGr.insert()) {
            this.publishProfile(profile);
            return sourceId;
        }
        return false;
    },

    //Create indexed source and search source and link to profile
    createDatasourceAndSearchSource: function(tableName, profile, name, conditions, mapToFields, notSearchableFields) {
        if (!tableName || !profile || !name) return false;

        var tablesToEnforce = gs.getProperty("glide.ais.require_retention_policy", "task").split(",");
        var rootTable = new TableUtils(tableName).getAbsoluteBase();

        var datasourceGr = new GlideRecord('ais_datasource');
        datasourceGr.initialize();
        datasourceGr.name = name;
        datasourceGr.source = tableName;
        if (new ArrayUtil().contains(tablesToEnforce, rootTable))
            datasourceGr.retention_policy = this.RETENTION_POLICY_TWO_YEARS;

        var datasourceId = datasourceGr.insert();

        if (!datasourceId) return false;

        //Map title, text, and sort by fields
        var mapValues = ['title', 'text', 'sort_by_date'];
        for (var i = 0; Array.isArray(mapToFields) && i < mapToFields.length && i < mapValues.length; i++)
            this.createFieldMapping(datasourceId, tableName, this.MAP_TO_ATTRIBUTE_SYS_ID, mapToFields[i], mapValues[i]);

        //Map not_searchable fields
        for (var j = 0; Array.isArray(notSearchableFields) && j < notSearchableFields.length; j++)
            this.createFieldMapping(datasourceId, tableName, this.NOT_SEARCHABLE_ATTRIBUTE_SYS_ID, notSearchableFields[j], true);

        new sn_ais.IndexEvent().indexTableNoBlock(tableName);
        return this.createAndlinkSearchSource(profile, tableName, name, conditions);
    },

    //Create field mapping for indexed source
    createFieldMapping: function(datasourceId, tableName, attribute, field, value) {
        var fieldMapGr = new GlideRecord('ais_datasource_field_attribute');
        fieldMapGr.initialize();
        fieldMapGr.datasource = datasourceId;
        fieldMapGr.source = tableName;
        fieldMapGr.attribute = attribute;
        fieldMapGr.field = field;
        fieldMapGr.value = value;
        fieldMapGr.insert();
    },

    //Update an existing search source
    updateSearchSource: function(sysId, name, conditions) {
        var sourceGr = new GlideRecord('ais_search_source');
        if (sourceGr.get(sysId)) {
            sourceGr.name = name;
            sourceGr.condition = conditions;
            sourceGr.update();
        }
    },

    //Fetch all search sources linked to a profile
    fetchSearchSourceForProfile: function(profile, getIndexingState, sourceType, excludeSkills) {
        if (!profile) return [];

        var _excludeSkills = excludeSkills === true ? true : false;

        var sourceArr = [];
        var m2mGr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
        m2mGr.addQuery('profile', profile);
        if (sourceType)
            m2mGr.addEncodedQuery('search_source.datasource.type=' + sourceType);
        if (_excludeSkills)
            m2mGr.addEncodedQuery('search_source.datasource.source!=sys_gen_ai_skill');
        m2mGr.query();
        while (m2mGr.next()) {
            var datasource = m2mGr.search_source.datasource.toString();
            sourceArr.push({
                name: m2mGr.search_source.name.toString(),
                sysId: m2mGr.getValue('search_source'),
                condition: m2mGr.search_source.condition.getDisplayValue(),
                condition_value: m2mGr.search_source.condition.toString(),
                datasource: datasource,
                datasource_name: m2mGr.search_source.datasource.getDisplayValue(),
                datasource_sys_id: m2mGr.search_source.datasource.sys_id.toString(),
                indexing_state: getIndexingState ? this.fetchIndexingState(datasource) : undefined,
                type: sourceType || undefined
            });
        }
        return sourceArr;
    },

    //Fetch the indexing state for an indexed source
    fetchIndexingState: function(datasource) {
        var stats = new GlideRecord('ais_ingest_datasource_stats');
        stats.addQuery('datasource', datasource);
        stats.orderByDesc('start');
        stats.query();
        return stats.next() ? stats.getValue('state') : 'never_indexed';
    },

    //Unlink search sources from profile
    unlinkSearchSources: function(profile, sourceArr) {
        if (!profile || !sourceArr) return false;

        var m2mGr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
        m2mGr.addQuery('profile', profile);
        m2mGr.addQuery('search_source', 'IN', sourceArr);
        m2mGr.query();
        m2mGr.deleteMultiple();
        this.publishProfile(profile);
        return true;
    },

    //Link search sources to profile
    linkSearchSources: function(profile, sourceArr) {
        if (!profile || !sourceArr) return false;

        var linked = false;
        for (var i in sourceArr) {
            var m2mGr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
            m2mGr.addQuery('profile', profile);
            m2mGr.addQuery('search_source', sourceArr[i]);
            m2mGr.query();
            if (!m2mGr.next()) {
                m2mGr.initialize();
                m2mGr.profile = profile;
                m2mGr.search_source = sourceArr[i];
                m2mGr.insert();
                linked = true;
            }
        }
        if (linked)
            this.publishProfile(profile);
    },

    //Fetch all search sources
    fetchAllSearchSources: function(profile, sourceType, excludeSkills) {
        var _excludeSkills = excludeSkills === true ? true : false;
        var sourceMap = {},
            mappedSources = {};

        if (profile) {
            var m2mGr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
            m2mGr.addQuery('profile', profile);
            if (sourceType)
                m2mGr.addEncodedQuery('search_source.datasource.type=' + sourceType);
            m2mGr.query();
            while (m2mGr.next())
                mappedSources[m2mGr.getValue('search_source')] = true;
        }

        var sourceGr = new GlideRecord('ais_search_source');
        if (sourceType)
            sourceGr.addEncodedQuery('datasource.type=' + sourceType);
        if (_excludeSkills)
            sourceGr.addEncodedQuery('datasource.source!=sys_gen_ai_skill');
        sourceGr.query();
        while (sourceGr.next()) {
            var sourceId = sourceGr.getUniqueValue();
            sourceMap[sourceId] = {
                name: sourceGr.name.toString(),
                sysId: sourceId,
                condition: sourceGr.condition.toString(),
                mapped: profile ? !!mappedSources[sourceId] : undefined,
                type: sourceType || undefined
            };
        }
        return sourceMap;
    },

    //Publish profile and related dictionaries
    publishProfile: function(sysId) {
        if (new sn_ais.StatusApi().isAisEnabled()) {
            var profile = new GlideRecord('ais_search_profile');
            if (profile.get(sysId)) {
                var dGr = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
                dGr.addQuery('profile', sysId);
                dGr.addQuery('marked_for_deletion', false);
                dGr.query();
                while (dGr.next()) {
                    if (dGr.dictionary.state != 'PUBLISHED' && dGr.dictionary.type != 'SPELLCHECK')
                        new sn_ais.Synchronizer().publishDictionary(dGr.dictionary.name.toString());
                }
                new sn_ais.Synchronizer().publishProfile(profile.name);
            }
        }
    },
    type: 'AISIndexSourceAPI'
};
