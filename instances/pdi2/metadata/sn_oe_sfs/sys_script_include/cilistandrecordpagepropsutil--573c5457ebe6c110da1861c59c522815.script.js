var CIListAndRecordPagePropsUtil = Class.create();
CIListAndRecordPagePropsUtil.prototype = {
    initialize: function() {
		this.ciPagePropsMetadata = new sn_oe_sfs.CIListRecordPropsMetadata();
    },
	_isNewRecord: function(sysId) {
        if (sysId.startsWith('-')) return true;
        return false;
    },
    _isTaggingSupported: function(table, sysId) {
        if (this._isNewRecord(sysId)) return false;
        if (this.ciPagePropsMetadata.BLACKLIST_TAGS_FROM_SUPPORTED_TABLES.indexOf(table) >= 0) return false;
        return true;
    },
    _isFormSupported: function(table, viewName) {
        var supportedList = this.ciPagePropsMetadata.SUPPORTED_TABLES;
        if (supportedList.indexOf(table) >= 0) return true;

        //check for view based support
        viewName = this.ciPagePropsMetadata.SUPPORTED_TABLES_VIEW;
        var formViewGr = new GlideAggregate('sys_ui_section');
        formViewGr.addEncodedQuery('view.name=' + GlideStringUtil.escapeQueryTermSeparator(viewName) + '^name=' + GlideStringUtil.escapeQueryTermSeparator(table), true);
        formViewGr.addAggregate('COUNT');
        formViewGr.query();
        if (formViewGr.next())
            return formViewGr.getAggregate('COUNT') > 0;

        //check for sys_property
        var supportedListViaPropValue = this.ciPagePropsMetadata.SUPPORTED_TABLES_VIA_PROP;
        if (supportedListViaPropValue) {
            var supportedListViaProp = supportedListViaPropValue.split(',').map(function(table) {
                return table.trim();
            });
            if (supportedListViaProp.indexOf(table) >= 0) return true;
        }
        return false;
    },
    _getScopeProperties: function(table, sysId) {
        return new global.ListAndRecordPagePropsUtil()._getScopeProperties(table,sysId);
    },
    _getTableName: function(table) {
        var metadata = this.ciPagePropsMetadata.TABLE_METADATA;
        if (metadata[table]) return metadata[table].heading;
        var sysDbGr = new GlideRecordSecure('sys_db_object');
        sysDbGr.addQuery('name', table);
        sysDbGr.query();
        if (sysDbGr.next()) {
            return sysDbGr.getDisplayValue('label');
        }
        return table;
    },
    _getRecordDisplayValue: function(table, sysId) {
		return new global.ListAndRecordPagePropsUtil()._getRecordDisplayValue(table, sysId);
    },
    _getProps: function(table, sysId) {
        var _self = this;
        var response = {
            'entry': _self._getEntryPage(),
            'supported': false,
            'heading': _self._getTableName(table),
            'title': '',
            'subheading': '',
            'richDescription': '',
            'filter': '',
            'view': '',
            'list_filter': '',
            'list_view': '',
            'form_filter': '',
            'form_view': '',
            'related_list_table': '',
            'custom_form': '',
            'custom_list': ''
        };
		response.title = response.heading;
		var _tableMetaData = _self.ciPagePropsMetadata.getCustomTableMetaData(table, sysId);
        if (_tableMetaData) {
            response.supported = true;
            response.entry = _self._getEntryPage(_tableMetaData.entry);
            response.heading = _tableMetaData.heading;
            response.title = _tableMetaData.title;
            response.subheading = _tableMetaData.subHeading;
            response.richDescription = _tableMetaData.richDescription;
            response.list_filter = _tableMetaData.list_filter;
            response.list_view = _tableMetaData.list_view;
            response.form_filter = _tableMetaData.form_filter;
            response.form_view = _tableMetaData.form_view;
            response.related_list_table = _tableMetaData.related_list_table;
            response.custom_form = _tableMetaData.custom_form;
            response.custom_list = _tableMetaData.custom_list;
        }

        return response;
    },
    _getRelatedListParentTableRecordSysId: function(table, sysId, query, field) {
        return new global.ListAndRecordPagePropsUtil()._getRelatedListParentTableRecordSysId(table, sysId, query, field);
    },

    _getMatches: function(field, query) {
        /*
        	matching pattern example
				field: context_profile
				query: context_profile=3a33973653211010a813ddeeff7b125a
				matches array:  ["context_profile=3a33973653211010a813ddeeff7b125a","3a33973653211010a813ddeeff7b125a"]	
        */
        var matches = [];
        var regex = new RegExp(field + '=(.*?)(?:\\^|\\^OR|$)', 'g');
        matches = regex.exec(query);
        return matches;
    },

    _hasWritePermission: function(table, sysId) {
		return new global.ListAndRecordPagePropsUtil()._hasWritePermission(table, sysId);
    },
    _getScopeName: function(scopeId) {
		if (scopeId && scopeId == 'global') {
            return gs.getMessage('Global');
        }
        if (scopeId) {
            var app = new GlideRecordSecure('sys_scope');
            if (app.get(scopeId)) {
                return app.getValue('name');
            }
            return '';
        }
    },
    _getEntryPage: function(route) {
        var entries = this.ciPagePropsMetadata.CRUMBS;
        var defaultLandingRoute = this.ciPagePropsMetadata.DEFAULT_LANDING_ROUTE;
        if (route && entries[route]) return entries[route];
        return entries[defaultLandingRoute];
    },

    _getRelatedListBreadcrumbPath: function(type, table, sysId) {
        var _self = this;
        switch (type) {
            case 'list':
                return _self.ciPagePropsMetadata.CUSTOM_TAG + '#' + 'list' + '#' + table;
            case 'form':
                var _formRoute = _self.ciPagePropsMetadata.TABLE_METADATA[table] && _self.ciPagePropsMetadata.TABLE_METADATA[table].custom_form;
                return _self.ciPagePropsMetadata.CUSTOM_TAG + '#' + (_formRoute || 'record') + '#' + (_formRoute ? '' : table) + '#' + sysId;
            default:
                return '';
        }
    },

    _generateBreadcrumbs: function(props, table, sysId, query, rlt) {
        var breadcrumbs = [],
            _self = this;
        var title = props.title;
        if (props.related_list_table) {
            var splittedRlt = props.related_list_table.split('.');
            var rltField = splittedRlt[0];
            var rltTable = splittedRlt[1];
            var rltRecord = _self._getRelatedListParentTableRecordSysId(table, sysId, query, rltField);
            breadcrumbs = _self._generateBreadcrumbs(_self._getProps(rltTable, sysId), rltTable, rltRecord, null, true).breadcrumbs;
        } else {
            breadcrumbs.push(props.entry);
            // Set the list view page of the table only for supported fields
            if (props.supported) {
                breadcrumbs.push({
                    page: rlt ? _self._getRelatedListBreadcrumbPath('list', table, sysId) : (props.custom_list || 'list'),
                    label: title,
                    filter: props.list_filter,
                    view: props.list_view
                });
            }
        }

        // Set the table's record form page (iff sysId exists)
        if (sysId) {
            title = (this._isNewRecord(sysId)) ? _self.ciPagePropsMetadata.DEFAULT_NEW_RECORD_LABEL : (_self._getRecordDisplayValue(table, sysId) || _self.ciPagePropsMetadata.DEFAULT_EMPTY_RECORD_LABEL);
            breadcrumbs.push({
                page: rlt ? _self._getRelatedListBreadcrumbPath('form', table, sysId) : 'record',
                label: title,
                filter: props.form_filter,
                view: props.form_view
            });
        }
        return {
            'breadcrumbs': breadcrumbs,
            'title': title
        };
    },
    _getPageProps: function(table, sysId, query, view) {
        var _self = this,
            pageProps = {},
            title;

        // Entry point
        var _props = _self._getProps(table, sysId);
        var breadcrumbs = _self._generateBreadcrumbs(_props, table, sysId, query, false) || {};
        var userScope = _self._getScopeProperties(table, sysId).userScope;
        var userScopeName = _self._getScopeName(userScope);

        pageProps = {
            title: breadcrumbs.title || "",
            breadcrumbs: breadcrumbs.breadcrumbs || [],
            heading: _props.heading,
            subHeading: _props.subheading,
            richDescription: _props.richDescription,
            filter: _props.filter,
            view: sysId ? _props.form_view : _props.list_view,
            is_scope_not_matched: !_self._getScopeProperties(table, sysId).scopeMatched,
            user_scope: userScope,
            record_scope: _self._getScopeProperties(table, sysId).tableScope,
            user_scope_name: userScopeName,
            record_scope_name: _self._getScopeProperties(table, sysId).tableScopeName,
            canWrite: _self._hasWritePermission(table, sysId)
        };
		//only applicable for forms
		if(sysId){
			pageProps.is_form_supported = _self._isFormSupported(table, view);
			pageProps.hide_tags = !(pageProps.is_form_supported && _self._isTaggingSupported(table, sysId));
		}
        return pageProps;
    },

    getPageProps: function(table, sysId, query, view) {
        try {
            return this._getPageProps(table, sysId, query, view);
        } catch (e) {
            gs.error('Fetching properties failed: ' + e);
            return [];
        }
    },

    type: 'CIListAndRecordPagePropsUtil'
};
