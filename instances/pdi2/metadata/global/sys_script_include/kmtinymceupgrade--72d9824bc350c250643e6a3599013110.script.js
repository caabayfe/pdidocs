var KMTinyMCEUpgrade = Class.create();
KMTinyMCEUpgrade.prototype = {

    initialize: function(tinyMCEToolbarSystemProperty, tinyMCEToolbarSystemPropertyOOBValue, tinyMCEPluginsSystemProperty, tinyMCEPluginsSystemPropertyOOBValue, beforeRenamedPlugins, beforeRenamedToolbar, afterRenamedPlugins, afterRenamedToolbar, beforeRenamedTemplatePlugins, beforeRenamedTemplateToolbar, afterRenamedTemplatePlugins, afterRenamedTemplateToolbar, newPlugins, newToolbar, advancedUpgradeFlag){
    this.tinyMCEToolbarSystemProperty = tinyMCEToolbarSystemProperty;
    this.tinyMCEToolbarSystemPropertyOOBValue = tinyMCEToolbarSystemPropertyOOBValue;
    this.tinyMCEPluginsSystemProperty = tinyMCEPluginsSystemProperty;
    this.tinyMCEPluginsSystemPropertyOOBValue = tinyMCEPluginsSystemPropertyOOBValue;
    this.beforeRenamedPlugins = beforeRenamedPlugins;
    this.beforeRenamedToolbar = beforeRenamedToolbar;
    this.afterRenamedPlugins = afterRenamedPlugins;
    this.afterRenamedToolbar = afterRenamedToolbar;
    this.beforeRenamedTemplatePlugins = beforeRenamedTemplatePlugins;
    this.beforeRenamedTemplateToolbar = beforeRenamedTemplateToolbar;
    this.afterRenamedTemplatePlugins = afterRenamedTemplatePlugins;
    this.afterRenamedTemplateToolbar = afterRenamedTemplateToolbar;
    this.newPlugins = newPlugins;
    this.newToolbar = newToolbar;
    this.advancedUpgradeFlag = advancedUpgradeFlag;
    this.fixScriptName = "fix_editor_toolbar_attributes_";

    if(!this.advancedUpgradeFlag)
        this.fixScriptName += "core.xml";
    else
        this.fixScriptName += "advanced.xml";

    },

	// upgrade function take cares about zboot and upgrade scenario after knowledge core and advanced plugin installed/upgraded
    upgrade: function() {

        var tableNames = this._getTableNames();
        var isPropertyCustomized = this._isSysPropertyCustomized();
         
        //if fix script runs first time for core and advanced plugin and system property is oob then new list of toolbar/plugins should be added for all html field dictionary attribute
        if (this._isFixScriptRunOnFirstTime(this.fixScriptName))
           {
              if(!isPropertyCustomized)
                 this._addEditorAttributes(tableNames);
           }
        else {
            var gr = new GlideRecord("sys_dictionary");
            gr.addQuery("name", "IN", tableNames);
            gr.addQuery("internal_type", "IN", "html,translated_html");
            gr.query();
            while (gr.next()) {
                var tableName = gr.getValue("name");
                var columnName = gr.getValue("element");
                var attribute = gr.getValue("attributes");

                var isEditorAttributePresent = !gs.nil(attribute) ? attribute.includes("editor.plugins") && attribute.includes("editor.toolbar") : false;

                if (!isEditorAttributePresent)
                    continue;

                var isEditorAttributeCustom = this._isEditorAttributeCustomized(attribute);

                if (isPropertyCustomized && !isEditorAttributeCustom)
                    this._removeEditorAttributes(tableName, columnName);
                else if (!isPropertyCustomized && !isEditorAttributeCustom)
                    this._addEditorAttributes(tableName, columnName);
            }
        }

    },

    //if upgrade happens for knowledge advanced plugin then it will return all article template table names else it will return knowledge table
    _getTableNames: function() {
        if (!this.advancedUpgradeFlag) {
            return "kb_knowledge";
        } else {
            var gr = new GlideRecord("kb_article_template");
            gr.query();
            var knowledgeTemplateTables = "";
            while (gr.next()) {
                knowledgeTemplateTables += gr.child_table + ",";
            }
            knowledgeTemplateTables = knowledgeTemplateTables.slice(0, -1);
            return knowledgeTemplateTables;
        }
    },

	//removes only specified attributes from dictionary entry for given table and column
    _removeEditorAttributes: function(tableName, columnName) {
        SNC.DictionaryAttribute.remove(tableName, columnName, "editor.plugins");
        SNC.DictionaryAttribute.remove(tableName, columnName, "editor.toolbar");
    },

	//adds new list of plugins and toolbar for given table and column
    _addEditorAttributes: function(tableName, columnName) {

        if (tableName && columnName) {
            SNC.DictionaryAttribute.set(tableName, columnName, "editor.plugins", this.newPlugins);
            SNC.DictionaryAttribute.set(tableName, columnName, "editor.toolbar", this.newToolbar);

        } else {
            var gr = new GlideRecord("sys_dictionary");
            gr.addQuery("name", "IN", tableName);
            gr.addQuery("internal_type", "IN", "html,translated_html");
            gr.query();
            while (gr.next()) {
                SNC.DictionaryAttribute.set(gr.getValue("name"), gr.getValue("element"), "editor.plugins", this.newPlugins);
                SNC.DictionaryAttribute.set(gr.getValue("name"), gr.getValue("element"), "editor.toolbar", this.newToolbar);
            }
        }
    },

	//checks tinyMCE system property is custiomized or not
	_isSysPropertyCustomized: function() {

	        var propName1 = this.tinyMCEToolbarSystemProperty;
	        var propName2 = this.tinyMCEPluginsSystemProperty;

	        //if both properties are not modified ever by customer then system property are not customized else it will compare system property value to OOB expected value
	        if (!this._isSysPropertyUpdated(propName1) && !this._isSysPropertyUpdated(propName2))
	            return false;
	        var oobValue1 = this.tinyMCEToolbarSystemPropertyOOBValue;
	        var oobValue2 = this.tinyMCEPluginsSystemPropertyOOBValue;
	        var custValue1 = gs.getProperty(propName1, "");
	        var custValue2 = gs.getProperty(propName2, "");
	        if (oobValue1 === custValue1.trim() && oobValue2 === custValue2.trim())
	            return false;
	        return true;

	    },

	//checks if property is modified ever
	_isSysPropertyUpdated: function(propName) {
	        var updateVersions = new GlideRecord("sys_update_version");
	        updateVersions.addQuery("record_name", propName);
	        updateVersions.query();
	        return updateVersions.getRowCount() >= 1;
	    },

    //checks attributes from dictionary entry for knowledge/template table is customized or not
    _isEditorAttributeCustomized: function(attrs) {

        var isToolbarCustomized = false;
        var isPluginCustomized = false;
        if (gs.nil(attrs))
            return false;

        var beforeRenamedPlugins, beforeRenamedToolbar, afterRenamedPlugins, afterRenamedToolbar, newPlugins, newToolbar;

        if (this.advancedUpgradeFlag) {
            beforeRenamedPlugins = this.beforeRenamedTemplatePlugins;
            beforeRenamedToolbar = this.beforeRenamedTemplateToolbar;
            afterRenamedPlugins = this.afterRenamedTemplatePlugins;
            afterRenamedToolbar = this.afterRenamedTemplateToolbar;
        } else {
            beforeRenamedPlugins = this.beforeRenamedPlugins;
            beforeRenamedToolbar = this.beforeRenamedToolbar;
            afterRenamedPlugins = this.afterRenamedPlugins;
            afterRenamedToolbar = this.afterRenamedToolbar;
        }

        newPlugins = this.newPlugins;
        newToolbar = this.newToolbar;

        var attributeArray = attrs.split(",");
        for (var counter = 0; counter < attributeArray.length; counter++) {
            var temp = attributeArray[counter].split("=");
            if (!gs.nil(temp[0]) && !gs.nil(temp[1]) && temp[0].trim() === "editor.toolbar" && temp[1].replace(/\s+/g, '') !== beforeRenamedToolbar.replace(/\s+/g, '') && temp[1].replace(/\s+/g, '') !== afterRenamedToolbar.replace(/\s+/g, '') && temp[1].replace(/\s+/g, '') !== newToolbar.replace(/\s+/g, ''))
                isToolbarCustomized = true;
            if (!gs.nil(temp[0]) && !gs.nil(temp[1]) && temp[0].trim() === "editor.plugins" && temp[1].replace(/\s+/g, '') !== beforeRenamedPlugins.replace(/\s+/g, '') && temp[1].replace(/\s+/g, '') !== afterRenamedPlugins.replace(/\s+/g, '') && temp[1].replace(/\s+/g, '') !== newPlugins.replace(/\s+/g, ''))
                isPluginCustomized = true;
        }
        return (isToolbarCustomized || isPluginCustomized);
    },

    //checks wheather fix script runs for first time
    _isFixScriptRunOnFirstTime: function(fixScriptName) {
        var gr = new GlideRecord("sys_update");
        gr.addEncodedQuery("name=" + fixScriptName);
        gr.query();
        return (gr.getRowCount() == 0);
    },

    type: 'KMTinyMCEUpgrade'
};
