var CMDBCumulativeDistributions = Class.create();
CMDBCumulativeDistributions.prototype = {

    //known platform field types that by data type may not hold values that are significant to field distributions
    INVALID_TYPES: {
        'address_simple' : false,
        'approval_rules': true,
        'audio': true,
        'auto_increment': true,
        'auto_number': true,
        'boolean': true,
        'bootstrap_color': true,
        'breakdown_element': true,
        'calendar_date_time': true,
        'catalog_preview': true,
        'char': false,
        'choice': false,
        'collection': true,
        'color': true,
        'color_display': true,
        'composite_field': true,
        'composite_name': true,
        'compressed': true,
        'conditions': true,
        'condition_string': true,
        'counter': true,
        'css': true,
        'currency': false,
        'currency2': false,
        'data_array': true,
        'data_object': true,
        'data_structure': true,
        'date': true,
        'datetime': true,
        'days_of_week': true,
        'day_of_week': true,
        'decimal': false,
        'documentation_field': true,
        'document_id': false,
        'domain_id': true,
        'domain_path': true,
        'due_date': true,
        'dynamic_attribute_store': true,
        'email': false,
        'email_script': true,
        'expression': true,
        'external_names': true,
        'field_list': true,
        'field_name': true,
        'file_attachment': true,
        'float': false,
        'formula': true,
        'geo_point': true,
        'glide_action_list': true,
        'glide_date': true,
        'glide_date_time': true,
        'glide_duration': true,
        'glide_list': true,
        'glide_precise_time': true,
        'glide_time': true,
        'glide_utc_time': true,
        'glide_var': true,
        'glyphicon': true,
        'graphql_schema': true,
        'GUID': true,
        'html': true,
        'html_script': true,
        'html_template': true,
        'icon': true,
        'image': true,
        'index_name': true,
        'insert_timestamp': true,
        'int': false,
        'integer': false,
        'integer_date': true,
        'integer_time': true,
        'internal_type': true,
        'ip_addr': false,
        'ip_address': false,
        'journal': true,
        'journal_input': true,
        'journal_list': true,
        'json': true,
        'json_translations': true,
        'language': true,
        'long': false,
        'longint': false,
        'mask_code': true,
        'metric_absolute': true,
        'metric_counter': true,
        'metric_derive': true,
        'metric_gauge': true,
        'mid_config': true,
        'month_of_year': true,
        'multi_small': true,
        'multi_two_lines': true,
        'name_values': true,
        'nds_icon': true,
        'nl_task_int1': true,
        'order_index': true,
        'password': true,
        'password2': true,
        'percent_complete': true,
        'phone_number': false,
        'phone_number_e164': false,
        'ph_number': false,
        'price': false,
        'properties': true,
        'radio': true,
        'record_hierarchy_path': true,
        'records': true,
        'reference': false,
        'reference_name': true,
        'related_tags': true,
        'reminder_field_name': true,
        'repeat_count': true,
        'repeat_type': true,
        'replication_payload': true,
        'schedule_date_time': true,
        'schedule_interval_count': true,
        'script': true,
        'script_client': true,
        'script_plain': true,
        'script_server': true,
        'short_field_name': true,
        'short_table_name': true,
        'simple_name_values': true,
        'slushbucket': true,
        'snapshot_template_value': true,
        'source_id': true,
        'source_name': true,
        'source_table': true,
        'string': false,
        'string_boolean': true,
        'string_full_utf8': false,
        'structure': true,
        'sysevent_name': true,
        'sysrule_field_name': true,
        'sys_class_name': true,
        'sys_class_path': true,
        'table_name': true,
        'template_value': true,
        'time': true,
        'timer': true,
        'translated': true,
        'translated_field': true,
        'translated_html': true,
        'translated_text': true,
        'tree_code': true,
        'tree_path': true,
        'url': true,
        'user_image': true,
        'user_input': true,
        'user_roles': true,
        'variables': true,
        'variable_conditions': true,
        'variable_template_value': true,
        'version': true,
        'video': true,
        'week_of_month': true,
        'wide_text': true,
        'wiki_text': true,
        'wms_job': true,
        'workflow': true,
        'workflow_conditions': true,
        'xml': true
    },

    DOMAIN_PLUGIN: 'com.glide.domain',
    DYNAMIC_MODEL_TABLE: 'cmdb_dynamic_ire_model',
    EXCLUSION_TABLE: 'cmdb_field_distribution_exclusion',
    DISTRIBUTION_TABLE: 'cmdb_field_distribution',
    TOTAL_KEY: '.total',
    TABLE_KEY: '.table',

    initialize: function(domain) {
        var plugin = GlidePluginManager.isActive(this.DOMAIN_PLUGIN);
        var dataSeparation = GlideDomainSupport.isDataSeparationEnabled();
        var ignoreDataSeparationProp = gs.getProperty('glide.identification_engine.domain_partitioning.ignore', 'false') == 'true';

        this._domain = domain || 'global';
        this._useDomain = plugin && (dataSeparation || ignoreDataSeparationProp);
        this._strictDomain = gs.getProperty('glide.identification_engine.platform_domain_separation_enabled', 'false') != 'true';

        //how total table rows and non-empty field values must exist to be statistically significant
        this.SAMPLE_SIZE_THRESHOLD = +gs.getProperty('glide.identification_engine.field_distribution.sample_size_minimum', '35');

        if (this.SAMPLE_SIZE_THRESHOLD < 1)
            this.SAMPLE_SIZE_THRESHOLD = 1;
    },

    scan: function() {
        this._getTables();
        this._getFields();
        this._getCounts();
        this._write();
    },

    _write: function() {
        this._truncate();

        for (var table in this._tables) {
            var counts = this._tables[table];
            var total = counts[this.TOTAL_KEY][0];
            for (var field in counts) {
                if (field == this.TOTAL_KEY)
                    continue;

                var notEmpty = counts[field][0];
                var distinct = counts[field][1];
                var dist = new GlideRecord(this.DISTRIBUTION_TABLE);
                dist.setValue('total_count', total);
                dist.setValue('table', table);
                dist.setValue('attributes', field);
                dist.setValue('non_null_count', notEmpty);
                dist.setValue('distinct_count', distinct);
                dist.setValue('accuracy', notEmpty / total);
                dist.setValue('cumulative_distribution', distinct / notEmpty);
                if (this._useDomain)
                    dist.setValue('sys_domain', this._domain);
                dist.insert();
            }
        }
    },

    _truncate: function() {
        var g = new GlideRecord(this.DISTRIBUTION_TABLE);
        if (this._useDomain)
            g.addQuery('sys_domain', this._domain);
        g.deleteMultiple();
    },

    _getCounts: function() {
        for (var table in this._tables) {
            var total = this._getTotalCount(table);
            if (total < this.SAMPLE_SIZE_THRESHOLD) {
                delete this._tables[table];
                continue;
            }

            for (var field in this._tables[table]) {
                var notEmpty = this._getNotEmptyCount(table, field);
                if (notEmpty < this.SAMPLE_SIZE_THRESHOLD) {
                    delete this._tables[table][field];
                    continue;
                }
                var distinct = this._getDistinctCount(table, field);
                this._tables[table][field] = [notEmpty, distinct];
            }

            this._tables[table][this.TOTAL_KEY] = [total];
        }
    },

    _getFields: function() {
        for (var table in this._tables) {
            var td = GlideTableDescriptor.get(table);
            var elementDescriptors = td.getSchemaList();
            var fields = {};
            for (var i = 0; i < elementDescriptors.size(); i++) {
                var ed = elementDescriptors.get(i);
                if (!this._isValidED(ed))
                    continue;

                if (this._isExcluded(table, ed.getName()))
                    continue;

                fields[ed.getName()] = null;
            }
            if (Object.keys(fields).length)
                this._tables[table] = fields;
            else
                delete this._tables[table];
        }
    },

    _getTables: function() {
        this._tables = {};

        var model = new GlideRecord(this.DYNAMIC_MODEL_TABLE);
        model.addActiveQuery();
        this._domainQuery(model);
        while (model.next()) {
            if (!this._isExcluded(model.getValue('cmdb_class')))
                this._tables[model.getValue('cmdb_class')] = null;
        }

        for (var table in this._tables) {
            var tableList = GlideDBObjectManager.get().getAllExtensions(table);
            for (var i = 0; i < tableList.size(); i++)
                if (!this._isExcluded(tableList.get(i)))
                    this._tables[tableList.get(i)] = null;
        }
    },

    _isValidED: function(ed) {
        if (ed.getName().startsWith('sys_') ||
            !ed.isActive() ||
            ed.isVirtual() ||
            !ed.isInDatabase() ||
            ed.isJournal() ||
            ed.isEncrypted() ||
            ed.isTimeType() ||
            ed.isDuration())
            return false;

        return !this.INVALID_TYPES[ed.getInternalType()];
    },

    _getDistinctCount: function(table, field) {
        var agg = new GlideAggregate(table);
        agg.addNotNullQuery(field);
        agg.addAggregate('COUNT(DISTINCT', field);
        agg.setGroup(false);
        this._domainQuery(agg);
        return agg.next() ? +agg.getAggregate('COUNT(DISTINCT', field) : 0;
    },

    _getNotEmptyCount: function(table, field) {
        var agg = new GlideAggregate(table);
        agg.addNotNullQuery(field);
        agg.addAggregate('COUNT');
        agg.setGroup(false);
        this._domainQuery(agg);
        return agg.next() ? +agg.getAggregate('COUNT') : 0;
    },

    _getTotalCount: function(table) {
        var agg = new GlideAggregate(table);
        agg.addAggregate('COUNT');
        agg.setGroup(false);
        this._domainQuery(agg);
        return agg.next() ? +agg.getAggregate('COUNT') : 0;
    },

    _domainQuery: function(gr) {
        var session = GlideSession.get();
        if (this._useDomain) {
            if (this._strictDomain) {
                gr.addQuery('sys_domain', this._domain);
                gr.queryNoDomain();
            } else {
                var currentDomain = session.getCurrentDomainID();
                try {
                    session.setDomainID(this._domain);
                    gr.query();
                } finally {
                    session.setDomainID(currentDomain);
                }
            }
        } else
            gr.query();
    },

    _isExcluded: function(table, field) {
        var hasField = !gs.nil(field);
        var tableList = GlideDBObjectManager.get().getTables(table);

        if (!this._excluded)
            this._queryExcluded();

        for (var i = 0; i < tableList.size(); i++) {
            var exclude = this._excluded[tableList.get(i)];
            var tableExcluded = exclude.hasOwnProperty(this.TABLE_KEY);
            var fieldExcluded = hasField && exclude.hasOwnProperty(field);

            //nothing here try next in hierarchy
            if (!tableExcluded && !fieldExcluded)
                continue;

            //inherited doesn't matter if not inherited (at index 0)
            if (i == 0 && (tableExcluded || fieldExcluded))
                return true;

            //does the exclusion here inhert to the table and field in question
            var tableInherited = !!exclude[this.TABLE_KEY];
            var fieldInherited = !!exclude[field];
            if ((tableExcluded && tableInherited) || (fieldExcluded && fieldInherited))
                return true;

            //stop if exclusion is found but does not inherit, further parents don't apply
            if ((tableExcluded && !tableInherited) || (fieldExcluded && !fieldInherited))
                break;
        }

        return false;
    },

    _queryExcluded: function() {
        var tables = {};
        var exclude = new GlideRecord(this.EXCLUSION_TABLE);
        exclude.addActiveQuery();
        this._domainQuery(exclude);

        while (exclude.next()) {
            var table = exclude.getValue('table');
            if (!tables.hasOwnProperty(table))
                tables[table] = {};

            var field = exclude.getValue('attributes');
            tables[table][field ? field : this.TABLE_KEY] = exclude.getValue('inherit') != '0';
        }

        this._excluded = tables;
    },

    type: 'CMDBCumulativeDistributions'
};
