var ListAndRecordPagePropsUtil = Class.create();
ListAndRecordPagePropsUtil.prototype = {
    initialize: function() {
    },
    _isNewRecord: function(sysId) {
        if (sysId.startsWith('-')) return true;
        return false;
    },
    _isTaggingSupported: function(table, sysId) {
        if (this._isNewRecord(sysId)) return false;
        return true;
    },
    _isFormSupported: function(table, viewName) {
        var formViewGr = new GlideAggregate('sys_ui_section');
        formViewGr.addEncodedQuery('view.name=' + viewName + '^name=' + table);
        formViewGr.addAggregate('COUNT');
        formViewGr.query();
        if (formViewGr.next())
            return formViewGr.getAggregate('COUNT') > 0;
        return false;
    },
    _getScopeProperties: function(table, sysId) {
        var scopeProps = {
            userScope: '',
            tableScope: '',
            tableScopeName: '',
            scopeMatched: false
        };
        if (!sysId) return scopeProps;

        var _scope = gs.getCurrentApplicationId();
        scopeProps.userScope = _scope == 'rhino.global' ? 'global' : _scope;
        scopeProps.tableScope = _scope;
        scopeProps.tableScopeName = _scope == 'global' ? gs.getMessage('Global') : '';
        var dbObjectGr = new GlideRecord(table);
        if (dbObjectGr.get(sysId)) {
            scopeProps.tableScope = dbObjectGr.sys_scope.toString();
            if (!scopeProps.tableScope) {
                scopeProps.tableScope = 'global';
                scopeProps.tableScopeName = gs.getMessage('Global');
            } else {
                scopeProps.tableScopeName = dbObjectGr.getDisplayValue('sys_scope');
            }
        }
        scopeProps.scopeMatched = _scope == scopeProps.tableScope;
        return scopeProps;
    },
    _getTableName: function(table) {
        var sysDbGr = new GlideRecordSecure('sys_db_object');
        sysDbGr.addQuery('name', table);
        sysDbGr.query();
        if (sysDbGr.next()) {
            return sysDbGr.getValue('label');
        }
        return table;
    },
    _getRecordDisplayValue: function(table, sysId) {
        var tableGr = new GlideRecordSecure(table);
        if (tableGr.get(sysId)) {
            return tableGr.getDisplayValue();
        }
        return sysId;
    },
    _getProps: function(table) {
        var _self = this;
        var response = {
            'supported': false,
            'heading': _self._getTableName(table),
			'title': '',
            'subheading': '',
            'filter': '',
            'view': '',
            'list_filter': '',
            'list_view': '',
            'form_filter': '',
            'from_view': '',
            'related_list_table': '',
            'custom_form': '',
            'custom_list': ''
        };
		response.title = response.heading;
        return response;
    },
	
	_getRelatedListParentTableRecordSysId: function(table, sysId, query, field) {
        try {
            if (this._isNewRecord(sysId) && query) {
                query = decodeURIComponent(query);
                var matches = this._getMatches(field,query);
                if (matches && matches[1]) return matches[1];
                return '';
            }
            var gr = new GlideRecord(table);
            if (gr.get(sysId)) {
                return gr.getValue(field);
            }
            return '';
        } catch (e) {
            return '';
        }
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
        var gr = new GlideRecordSecure(table);
        if (gr.get(sysId)) {
            return gr.canWrite();
        }
        return false;
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

    _getPageProps: function(table, sysId, query, view) {
        var _self = this,
            pageProps = {},
            title;

        // Entry point
        var _props = _self._getProps(table);
        var userScope = _self._getScopeProperties(table, sysId).userScope;
        var userScopeName = _self._getScopeName(userScope);

        pageProps = {
            heading: _props.heading,
            subHeading: _props.subheading,
            filter: _props.filter,
            view: _props.view,
            is_scope_not_matched: !_self._getScopeProperties(table, sysId).scopeMatched,
            user_scope: userScope,
            record_scope: _self._getScopeProperties(table, sysId).tableScope,
            user_scope_name: userScopeName,
            record_scope_name: _self._getScopeProperties(table, sysId).tableScopeName,
            canWrite: _self._hasWritePermission(table, sysId),
            is_form_supported: _self._isFormSupported(table, view)
        };
        pageProps.hide_tags = !(pageProps.is_form_supported && _self._isTaggingSupported(table, sysId));
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
    type: 'ListAndRecordPagePropsUtil'
};
