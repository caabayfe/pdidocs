var StarterWorkspace = Class.create();
StarterWorkspace.prototype = {
    initialize: function(experienceID) {
        this.EXPERIENCE_ID = experienceID;
        this.DEFAULT_VIEW_NAME = "Default view";
        this.WS_EXP_RECORD = experienceID && this.getWsExperience();
        this.APP_SCOPE_ID = experienceID ? this.WS_EXP_RECORD.sys_scope.toString() : "";
        this.APP_SCOPE_NAME = experienceID ? this.WS_EXP_RECORD.sys_scope.scope.toString() : "";
        this.WS_VIEW_NAME = '';
        this.WS_UIVIEW_SYSID = '';
        this.WS_TABLE_NAME = '';
        this.WS_DEFAULT_LIST_SYSID = '';
        this.WS_NEW_LIST_SYSID = '';
        this.WS_DEFAULT_RELLIST_SYSID = '';
        this.WS_NEW_RELLIST_SYSID = '';
        this.RECORD_PARENT_MACROPONENT = '';
        this.UX_SCREEN_MACROPONENT = '';
        this.UX_SCREEN_TYPE = '';
        this.UX_SCREEN_MACROPONENT_CONFIG = '';
        this.WS_TABLE_LABEL = '';
        this.EXPERIENCE_NAME = experienceID ? this.WS_EXP_RECORD.title.toString() : "";
        this.ARRAY_UTILS = new global.ArrayUtil();
        this.RECORD_LIMIT = 20;
    },

    createNewRecord: function(tableName) {
        var newRec = new GlideRecord(tableName);
        newRec.initialize();
        return newRec;

    },

    getAllExcludedTables: function() {

        var allExcludedTables = ['sys_scope', 'sys_package', 'sys_metadata']; // base table
        var excludedTables = this.getExcludedTable(allExcludedTables.join(',')); // extending base table
        var excludedTabled_ext = this.getExcludedTable(excludedTables.join(',')); // extending extended base table
        var rotatedTables = this.getRotatedTables();
        allExcludedTables = allExcludedTables.concat(excludedTabled_ext, excludedTables, rotatedTables);
        allExcludedTables = this.ARRAY_UTILS.unique(allExcludedTables);

        return allExcludedTables;

    },

    getExcludedTable: function(excludedTableStr) {

        var tablesExcluded = [];
        var tablesGR = new GlideRecord('sys_db_object');
        tablesGR.addQuery('super_class.name', 'IN', excludedTableStr);
        tablesGR.orderBy('label');
        tablesGR.query();
        while (tablesGR.next()) {
            tablesExcluded.push(tablesGR.getValue('name'));
        }
        return tablesExcluded;

    },

    getRotatedTables: function() {
        var rotations = [];

        var rotatedExtension = new GlideRecord("sys_table_rotation_schedule");
        rotatedExtension.query();

        while (rotatedExtension.next()) {
            rotations.push(rotatedExtension.getValue("table_name"));
        }
        return rotations;
    },

    shouldExcludeTable: function(tableName) {

        if (this.startsWith(tableName, 'v_') ||
            this.startsWith(tableName, 'sysx_') ||
            this.startsWith(tableName, 'var__') ||
            this.startsWith(tableName, 'ts_'))
            return true;

        return false;

    },

    startsWith: function(str, word) {
        return str.lastIndexOf(word, 0) === 0;
    },

    fetchTables: function(inScopeTable, query, filterTables, inputText, scope) {
        var tables_output = [];
        var self = this;

        function addAdditionalQueries(gr, self) {
            inScopeTable ? gr.addEncodedQuery("sys_scope=" + scope) : gr.addEncodedQuery("sys_scope!=" + scope);
            query && gr.addEncodedQuery(query);
            inputText ? gr.setLimit(inputText.length * self.RECORD_LIMIT) : gr.setLimit(self.RECORD_LIMIT);
        }
        var allExcludeTables = this.getAllExcludedTables();
        var table = new GlideRecord("sys_db_object");
        addAdditionalQueries(table, self);
        table.orderBy('label');
        table.query();
        while (table.next()) {
            var tableName = table.getValue("name");
            var tableProperties = {};
            if (filterTables == "ONLY_DEF_VIEW_TABLES") {
                if (!this.shouldExcludeTable(tableName) && !this.ARRAY_UTILS.contains(allExcludeTables, tableName) && this.checkIfDefaultView(tableName)) {

                    tableProperties.id = table.getValue('name');
                    tableProperties.sys_id = table.getUniqueValue();
                    tableProperties.label = table.getDisplayValue('label');
                    tableProperties.sublabel = table.getValue('name');

                    tables_output.push(tableProperties);
                }
            } else {
                tableProperties.id = table.getValue('name');
                tableProperties.sys_id = table.getUniqueValue();
                tableProperties.label = table.getDisplayValue('label');
                tableProperties.sublabel = table.getValue('name');

                tables_output.push(tableProperties);
            }

        }
        return tables_output;
    },

    checkIfDefaultView: function(tableName) {

        var secGr = new GlideRecord('sys_ui_section');
        secGr.addEncodedQuery("view=Default view^name=" + tableName);
        secGr.query();
        if (secGr.next())
            return true;
        else
            return false;

    },

    checkVariantTable: function(tableNames) {

        var expectedTables = [];
        var allExcludedTables = this.getAllExcludedTables();
        for (var i = 0; i < tableNames.length; i++) {
            if (!this.shouldExcludeTable(tableNames[i]) && !this.ARRAY_UTILS.contains(allExcludedTables, tableNames[i])) {
                if (this.checkIfDefaultView(tableNames[i].toString())) {
                    expectedTables.push(tableNames[i].toString());
                }
            }
        }
        return this.ARRAY_UTILS.unique(expectedTables);
    },

    getWorskapceView: function() {
        var page_property = new GlideRecord("sys_ux_page_property");
        page_property.addEncodedQuery("page=" + this.EXPERIENCE_ID + "^name=view");
        page_property.query();
        if (page_property.next()) {

            this.WS_VIEW_NAME = global.JSUtil.notNil(page_property.value) ? this.getViewName(page_property.value.toString()) : "";

            if (global.JSUtil.nil(this.WS_VIEW_NAME)) {
                var viewPropObj = {
                    "value": this.getViewUniqueName()
                };

                this.WS_VIEW_NAME = viewPropObj.value;

                new global.UXStarterExperiencePostOperation().update(page_property, viewPropObj);
            }
        }else if (global.JSUtil.nil(this.WS_VIEW_NAME))
            this.WS_VIEW_NAME = this.getViewUniqueName();   
     	if (!this.getViewDetails()) {
            this.createView();
        }
        return this.WS_VIEW_NAME;
    },

    getViewName: function(viewName) {
        var uiView = new GlideRecord("sys_ui_view");
        uiView.addEncodedQuery("name=" + viewName + "^ORtitle=" + viewName.replaceAll("-", ""));
        uiView.query();
        if (uiView.next())
            return uiView.name.toString();
    },

    createView: function() {
        var sysView = new GlideRecord('sys_ui_view');
        var viewObject = {
            "name": this.WS_VIEW_NAME,
            "title": this.WS_VIEW_NAME.replaceAll('-', ' '),
            "sys_scope": this.APP_SCOPE_ID
        };
        new global.UXStarterExperiencePostOperation().insert(sysView, viewObject);
    },

    getViewUniqueName: function(expName) {
        this.EXPERIENCE_NAME = this.EXPERIENCE_NAME || expName;
        return this.identifyUniqueName();
    },

    identifyUniqueName: function() {
        var urlVar = this.EXPERIENCE_NAME.replace(/[`~!@#$%^&*()|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
        urlVar = urlVar.replaceAll(' ', '-');
        var i = 0;
        this.WS_VIEW_NAME = "Workspace-" + urlVar + "-" + i;
        while (this.getViewDetails()) {
            this.WS_VIEW_NAME = "Workspace-" + urlVar + "-" + i++;
        }
        return this.WS_VIEW_NAME;
    },

    getViewDetails: function() {
        var getView = new GlideRecord("sys_ui_view");
        getView.addEncodedQuery('name=' + this.WS_VIEW_NAME + '^ORtitle=' + this.WS_VIEW_NAME.replaceAll('-', ' '));
        getView.query();
        if (getView.next()) {
            this.WS_UIVIEW_SYSID = getView.getValue("sys_id").toString();
            return true;
        }
        return false;
    },

    getWsExperience: function() {
        var expGr = new GlideRecord("sys_ux_page_registry");
        if (expGr.get(this.EXPERIENCE_ID))
            return expGr;
    },

    createRelatedLists: function() {
        this.WS_NEW_LIST_SYSID = this.getListID();
        if (this.WS_NEW_LIST_SYSID)
            this.createListElements();
        this.WS_NEW_RELLIST_SYSID = this.getRelatedListID();
        if (this.WS_NEW_RELLIST_SYSID)
            this.createRelListEntries();
    },

    getListID: function() {
        var defaultList = new GlideRecord("sys_ui_list");
        defaultList.addQuery('name', this.WS_TABLE_NAME);
        defaultList.addQuery("view.title", this.DEFAULT_VIEW_NAME);
        defaultList.addNullQuery("view.name");
        defaultList.query();
        if (defaultList.next()) {
            this.WS_DEFAULT_LIST_SYSID = defaultList.getValue("sys_id");
            defaultList.initialize();
            var newListObject = {
                "view": this.WS_UIVIEW_SYSID,
                "name": this.WS_TABLE_NAME,
                "sys_scope": this.APP_SCOPE_ID
            };
            return new global.UXStarterExperiencePostOperation().insert(defaultList, newListObject);
        }
        return;
    },

    createListElements: function() {
        var defaultListElements = new GlideRecord("sys_ui_list_element");
        defaultListElements.addQuery("list_id", this.WS_DEFAULT_LIST_SYSID);
        defaultListElements.orderBy("position");
        defaultListElements.query();
        while (defaultListElements.next()) {
            var newListElementObject = {
                "list_id": this.WS_NEW_LIST_SYSID,
                "element": "",
                "position": ""
            };
            newListElementObject.element = defaultListElements.getValue("element");
            newListElementObject.position = defaultListElements.getValue("position");
            var starterPost = new global.UXStarterExperiencePostOperation();
            starterPost.insert(this.createNewRecord(defaultListElements.getRecordClassName()), newListElementObject);
        }
    },

    getRelatedListID: function() {
        var defaultRelList = new GlideRecord("sys_ui_related_list");
        defaultRelList.addQuery("name", this.WS_TABLE_NAME);
        defaultRelList.addQuery("view.title", this.DEFAULT_VIEW_NAME);
        defaultRelList.addNullQuery("view.name");
        defaultRelList.query();
        if (defaultRelList.next()) {
            this.WS_DEFAULT_RELLIST_SYSID = defaultRelList.getValue('sys_id');
            defaultRelList.initialize();
            var newRelList = {
                "name": this.WS_TABLE_NAME,
                "view": this.WS_UIVIEW_SYSID,
                "sys_scope": this.APP_SCOPE_ID
            };
            return new global.UXStarterExperiencePostOperation().insert(defaultRelList, newRelList);
        }
        return;
    },

    createRelListEntries: function() {
        var defaultRelListEntry = new GlideRecord("sys_ui_related_list_entry");
        defaultRelListEntry.addQuery("list_id", this.WS_DEFAULT_RELLIST_SYSID);
        defaultRelListEntry.orderBy("position");
        defaultRelListEntry.query();
        while (defaultRelListEntry.next()) {
            var newRelListEntryObj = {};
            newRelListEntryObj.list_id = this.WS_NEW_RELLIST_SYSID;
            newRelListEntryObj.related_list = defaultRelListEntry.getValue("related_list");
            newRelListEntryObj.position = defaultRelListEntry.getValue("position");
            newRelListEntryObj.filter = defaultRelListEntry.getValue("filter");
            new global.UXStarterExperiencePostOperation().insert(this.createNewRecord(defaultRelListEntry.getRecordClassName()), newRelListEntryObj);
        }
    },

    getDefaultViewSections: function() {
        var viewSections = [];
        var uiSection = new GlideRecord("sys_ui_section");
        uiSection.addQuery("name", this.WS_TABLE_NAME);
        uiSection.addQuery("view.title", this.DEFAULT_VIEW_NAME);
        uiSection.addNullQuery("view.name");
        uiSection.query();
        while (uiSection.next()) {
            viewSections.push(uiSection.getValue("sys_id") + "");
        }
        if (viewSections.length <= 1)
            return viewSections;
        var orderFormSection = new GlideRecord("sys_ui_form_section");
        orderFormSection.addQuery("sys_ui_section.sys_id", "IN", viewSections);
        orderFormSection.orderBy("position");
        orderFormSection.query();
        viewSections = [];
        while (orderFormSection.next()) {
            viewSections.push(orderFormSection.getValue("sys_ui_section"));
        }

        // User case: may be multiple UI form sections for a single UI section
        // Removing duplicate UI sections
	return this.ARRAY_UTILS.unique(viewSections);
    },
    executeScheduler: function(parameters) {

        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName('Cloning Default View');
        worker.setBackground(true);
        worker.setScriptIncludeName('ViewCloneDefaultWorker');
        worker.setScriptIncludeMethod('process');
        worker.putConstructorArg('parameters', parameters);
        worker.start();

        var isSectionCreated = false;
        parameters = JSON.parse(parameters);
        var sectionsCount = JSON.parse(parameters.sysparm_sections).length;
        while (this.confirmSectionsCreated(sectionsCount)) {
            isSectionCreated = true;
        }

        if (isSectionCreated) {
            var tables = ["sys_ui_form", "sys_ui_section", "sys_ui_list", "sys_ui_related_list"];
            for (var i = 0; i < tables.length; i++) {
                this.captureFormsIntoUpdateSet(tables[i]);
            }
            return;
        }
    },
    captureFormsIntoUpdateSet: function(table) {
        var recordCapture = new GlideRecord(table);
        recordCapture.addQuery("view", this.WS_UIVIEW_SYSID);
        recordCapture.addQuery("name", this.WS_TABLE_NAME);
        recordCapture.query();
        while (recordCapture.next()) {
            new global.UXStarterExperiencePostOperation().exportIntoUpdateSet(recordCapture);
        }
    },
    confirmSectionsCreated: function(sectionsCount) {
        var sections = new GlideRecord("sys_ui_section");
        sections.addQuery("view", this.WS_UIVIEW_SYSID);
        sections.addQuery("name", this.WS_TABLE_NAME);
        sections.query();
        return !(sectionsCount == sections.getRowCount());
    },

    createViewfromDefalutView: function(tables, wsView) {
        if (global.JSUtil.notNil(wsView)) {
            this.WS_VIEW_NAME = wsView;
        }
        var paramsObj = {
            "sysparm_title": "",
            "sysparm_view": "",
            "sysparm_sections": "[]"
        };
        for (var i = 0; i < tables.length; i++) {
            this.WS_TABLE_NAME = tables[i];
            if (global.JSUtil.notNil(this.WS_TABLE_NAME)) {
                var sections = this.getDefaultViewSections();
                paramsObj.sysparm_table = sections[0],
                    paramsObj.sysparm_sections = JSON.stringify(sections);
                paramsObj.sysparm_title = this.WS_VIEW_NAME.replaceAll("-", " ");
                paramsObj.sysparm_view = this.WS_VIEW_NAME;
                this.createRelatedLists();
                this.executeScheduler(JSON.stringify(paramsObj));
            }
        }
    },

	getScreenCollectionID: function() {

        var routeRecord = new GlideRecordSecure("sys_ux_app_route");
        routeRecord.addQuery("app_config", this.WS_EXP_RECORD.admin_panel.toString());
        routeRecord.addQuery("route_type", "record");
        routeRecord.query();
        if (routeRecord.next())
            return routeRecord.getValue("screen_type");

        return;
    },

    createVariants: function(tableNames, variantName) {
		var variantDetials = [];
        try {
            var uxScreen = new GlideRecord('sys_ux_screen');
            for (var i = 0; i < tableNames.length; i++) {
                this.WS_TABLE_NAME = tableNames[i];
                if (global.JSUtil.nil(this.WS_TABLE_NAME))
                    continue;
                this.WS_TABLE_LABEL = this.getTableLabel();
                var fields = new Object();
				var screenTypeSysId = this.getScreenCollectionID();
                var getUxScreen = new GlideRecord('sys_ux_screen');
                getUxScreen.addEncodedQuery('app_config=' + this.WS_EXP_RECORD.admin_panel + '^screen_type='+screenTypeSysId); 
                getUxScreen.orderBy('sys_created_on');
                getUxScreen.query();
                if (getUxScreen.next()) {
                    for (var key in getUxScreen) {
                        if (key != 'sys_meta' && getUxScreen.getElement(key).getED().getInternalType() == 'glide_list') {
                            fields[key] = getUxScreen[key].toString();
                        } else {
                            fields[key] = getUxScreen[key];
                        }
                    }
                    this.UX_SCREEN_MACROPONENT = getUxScreen.macroponent.toString();
                    fields.name = global.JSUtil.notNil(variantName) ? variantName : this.WS_TABLE_LABEL + ' Record Page';
                    fields.order = 100;
                    fields.screen_condition = 'table=' + this.WS_TABLE_NAME;
                    fields.macroponent = this.createPageDefinition();
                    variantDetials[i] = {
                        'sysId': (new global.UXStarterExperiencePostOperation().insert(uxScreen, fields)).toString(),
                        'name': fields.name
                    };
                } else {
                    gs.error("Workspace UI Template: createVariants error - no default record page");
                    return {
                        status: "failed",
                        message: "no default record page",
                        variantDetails: variantDetials
                    };
                }
            }
            return {
                status: "success",
                message: "success",
                variantDetails: variantDetials

            };
        } catch (e) {
            gs.error('Workspace template error occurred at : createVariants function with error -' + e);
            return {
                status: "failed",
                message: e.message,
                variantDetails: variantDetials
            };
        }
    },
    createPageDefinition: function() {
        try {
            var pdSys = '';
            var pdGr = new GlideRecord('sys_ux_macroponent');
            pdGr.addEncodedQuery('sys_id=' + this.UX_SCREEN_MACROPONENT);
            pdGr.query();
            if (pdGr.next()) {
                var pdFields = new Object();
                for (var key in pdGr) {
                    if (key != 'sys_meta' && pdGr.getElement(key).getED().getInternalType() == 'glide_list') {
                        pdFields[key] = pdGr[key].toString();
                    } else {
                        pdFields[key] = pdGr[key];
                    }
                }
                pdFields.name = this.WS_TABLE_LABEL;
                pdSys = new global.UXStarterExperiencePostOperation().insert(pdGr, pdFields);
                var uxcsGr = new GlideRecord('sys_ux_client_script');
                uxcsGr.addEncodedQuery('macroponent=' + this.UX_SCREEN_MACROPONENT);
                uxcsGr.query();
                while (uxcsGr.next()) {
                    var uxcsFields = new Object();
                    for (var val in uxcsGr)
                        uxcsFields[val] = uxcsGr[val];
                    uxcsFields.macroponent = pdSys;
                    new global.UXStarterExperiencePostOperation().insert(uxcsGr, uxcsFields);
                }
            }
            return pdSys;
        } catch (e) {
            gs.error('Workspace template error occurred at : createPageDefinition function with error - ' + e);
        }
    },

    getTableLabel: function(name) {
        var tableName = global.JSUtil.notNil(name) ? name : this.WS_TABLE_NAME;
        var dbGr = new GlideRecord('sys_db_object');
        dbGr.addQuery('name', tableName);
        dbGr.query();
        if (dbGr.next())
            return dbGr.getDisplayValue("label").toString();
    },
    getLatestRecord: function(table_name) {
        var gr_rec = new GlideRecord(table_name);
        gr_rec.orderByDesc('sys_created_on');
        gr_rec.query();
        if (gr_rec.next()) {
            return gr_rec.sys_id.toString();
        }
        return "no_record";
    },
    type: 'StarterWorkspace'
};
