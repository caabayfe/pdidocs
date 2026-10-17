var NLUSystemUtil = Class.create();

(function() {
    var nluService = sn_ml.MLServiceUtil;

    var constants = NLUConstants.constants;
    var tables = NLUConstants.tables;

    NLUSystemUtil.prototype = {
        initialize: function() {},

        type: 'NLUSystemUtil'
    };

    NLUSystemUtil.getCount = function(table, filter) {
        var ga = new GlideAggregate(table);
        if (filter) ga.addEncodedQuery(filter);
        ga.addAggregate('COUNT');
        ga.query();
        return (ga.next() && parseInt(ga.getAggregate('COUNT'))) || 0;
    };

    NLUSystemUtil.getGroupByCount = function(table, groupBy, filter) {
        if (!groupBy) return {};

        var groupByCount = {};
        var ga = new GlideAggregate(table);
        if (filter) ga.addEncodedQuery(filter);
        ga.addAggregate('COUNT', groupBy);
        ga.query();
        while (ga.next()) {
            groupByCount[ga.getValue(groupBy)] = parseInt(ga.getAggregate('COUNT', groupBy)) || 0;
        }
        return groupByCount;
    };

    NLUSystemUtil.getScope = function(appName) {
        var gr = new GlideRecord(tables.SYS_SCOPE);
        return gr.get('scope', appName) && gr.getUniqueValue();
    };

    NLUSystemUtil.checkScope = function(scopeId) {
        var gr = new GlideRecord(tables.SYS_APP);
        if (gr.get(scopeId)) return true;

        gr = new GlideRecord(tables.STORE_APP);
        return (
            gr.get(scopeId) &&
            gr.isValidField('can_edit_in_studio') &&
            gr.getValue('can_edit_in_studio') == 1
        );
    };

    NLUSystemUtil.getCurrentDomain = function() {
        return gs.getSession().getCurrentDomainID();
    };

    NLUSystemUtil.getTableFieldValues = function(tableName, fieldName) {
        var records = [],
            value;
        if (tableName && fieldName) {
            try {
                var tableRec = new GlideRecord(tableName);
                var glideElement = tableRec.getElement(fieldName);
                var descriptor = glideElement.getED();
                if (
                    descriptor.getInternalType() === 'choice' ||
                    (descriptor.getInternalType() === 'string' &&
                        descriptor.getChoiceField())
                ) {
                    var cList = new GlideChoiceList();
                    if (new GlideRecord(tableName).isValidField(fieldName)) {
                        var clg = new GlideChoiceListGenerator(tableName, fieldName);
                        clg.setCache(false);
                        clg.setNone(false);
                        clg.get(cList);
                        cList.removeChoice('NULL_OVERRIDE');
                        for (var i = 0, l = cList.getSize(); i < l; i++) {
                            records.push(cList.getChoice(i).getLabel());
                        }
                    }
                } else {
                    var count = 0;
                    var gAgg = new GlideAggregate(tableName);
                    gAgg.addNotNullQuery(fieldName);
                    gAgg.groupBy(fieldName);
                    gAgg.orderBy(fieldName);
                    gAgg.query();
                    while (gAgg.next() && count < constants.TABLE_VALUES_LIMIT) {
                        records.push(gAgg.getValue(fieldName));
                        count++;
                    }
                }
            } catch (e) {
                gs.addErrorMessage(
                    gs.getMessage('Unable to fetch field values from : {0}', tableName)
                );
            }
        }
        return records;
    };

    NLUSystemUtil.copyRecord = function(table, fields, obj) {
        var gr = new GlideRecord(table);
        gr.newRecord();
        fields.forEach(function(field) {
            gr[field] = obj[field];
        });
        return gr.insert();
    };

    NLUSystemUtil.createRecord = function(table, obj) {
        return NLUSystemUtil.copyRecord(table, Object.keys(obj), obj);
    };

    NLUSystemUtil.updateRecords = function(table, filter, data) {
        if (!filter || !data) return null;
        var gr = new GlideRecord(table);
        gr.addEncodedQuery(filter);
        for (var key in data) {
            gr.setValue(key, data[key]);
        }
        return gr.updateMultiple();
    };

    NLUSystemUtil.copyRecordFromGR = function(
        table,
        fields,
        srcGr,
        newProps,
        disableBr
    ) {
        var gr = new GlideRecord(table);
        if (disableBr) gr.setWorkflow(false);
        gr.newRecord();
        fields.forEach(function(field) {
            gr[field] = srcGr.getValue(field);
        });
        NLUHelper.extend(gr, newProps);
        return gr.insert();
    };

    NLUSystemUtil.updateOrInsert = function(table, field, value, data) {
        var gr = new GlideRecord(table);
        var sysId = null;
        if (gr.get(field, value)) {
            var changed = false;
            if (data) {
                for (var key in data) {
                    var currentVal = gr.getValue(key);
                    if (currentVal != data[key]) {
                        gr.setValue(key, data[key]);
                        changed = true;
                    }
                }
            }
            if (changed) sysId = gr.update();
        } else {
            gr.setValue(field, value);
            data &&
                Object.keys(data).forEach(function(key) {
                    gr.setValue(key, data[key]);
                });
            sysId = gr.insert();
        }
        return sysId;
    };

    NLUSystemUtil.getLastUpdatedOn = function(table, filter) {
        var gr = new GlideRecord(table);
        if (filter) gr.addEncodedQuery(filter);
        gr.orderByDesc('sys_updated_on');
        gr.setLimit(1);
        gr.query();

        if (gr.next()) return new GlideDateTime(gr.getValue('sys_updated_on'));
        return null;
    };

    /**
      Returns an object from Glide Record.
      'fields' can be an array ex: ['name', 'display_name', 'description'];
      OR a map ex: {name: 'name', label: 'display_name', desc: 'description'};
      */
    NLUSystemUtil.getObjectFromGR = function(gr, fields) {
        if (!gr || gs.nil(gr)) return {};

        var obj = {};
        for (var key in fields) {
            var fieldKey = Array.isArray(fields) ? fields[key] : key;
            if (gr.isValidField(fields[key])) {
                obj[fieldKey] = gr.getValue(fields[key]);
            }
        }
        return obj;
    };

    NLUSystemUtil.getUserName = function(userId) {
        var userName,
            user = gs.getUser().getUserByID(userId);
        if (user) {
            userName = user.getFullName();
        }
        return userName;
    };

    NLUSystemUtil.getNLUEditors = function() {
        var gr = new GlideRecord('sys_user');
        gr.addQuery('roles=nlu_editor');
        gr.query();
        var editors = [];
        while (gr.next()) {
            editors.push({
                firstName: gr.getValue('first_name') || '',
                lastName: gr.getValue('last_name') || '',
                email: gr.getValue('email') || '',
                sysId: gr.getUniqueValue()
            });
        }
        return editors;
    };

    NLUSystemUtil.isMaint = function() {
        return gs.getUser().hasRole('maint');
    };

    NLUSystemUtil.isRecordChanged = function(fields, previous, current) {
        if (!previous) return current;
        for (var i in fields) {
            if (previous.getValue(fields[i]) != current.getValue(fields[i]))
                return true;
        }
        return false;
    };

    NLUSystemUtil.getLanguageCode = function(langSysId) {
        var langGr = new GlideRecord(tables.SYS_LANGUAGE);
        return langGr.get(langSysId) && langGr.getValue('id');
    };

    NLUSystemUtil.isNluAdvancedPluginActive = function() {
        return GlidePluginManager.isActive('com.snc.nlu.workbench.advanced');
    };

    NLUSystemUtil.isNLUAdvUtahSupported = function() {
        var scopedApp = new GlideRecord("sys_store_app");
        scopedApp.addQuery("scope", "sn_nlu_workbench");
        scopedApp.query();
        if (scopedApp.next()) {
            var nluAdvVersion = scopedApp.getValue('version');
            if (parseFloat(nluAdvVersion) >= 6.0)
                return true;
        }
    };

    NLUSystemUtil.canPerformEditOperations = function(modelId) {
        var nluEditors = NLUSystemUtil.getNLUEditors();
        var assignedEditors = sn_nlu_workbench.NLUCoreUtils.getAssignedEditors(modelId);

        var selectedEditors = nluEditors.filter(function(editor) {
            return assignedEditors.indexOf(editor.sysId) !== -1;
        });

        var isNluAdmin = gs.getUser().hasRole('nlu_admin');
        var userID = gs.getUserID();

        var isAssignedEditor = selectedEditors.some(function(user) {
            return user.sysId === userID;
        });

        return isAssignedEditor || isNluAdmin;
    };

})();
