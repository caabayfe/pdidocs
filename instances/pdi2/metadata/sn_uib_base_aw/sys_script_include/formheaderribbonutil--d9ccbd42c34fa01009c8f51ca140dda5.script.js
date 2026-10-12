var FormHeaderRibbonUtil = Class.create();
FormHeaderRibbonUtil.prototype = {
  initialize: function () {
  },

  TABLE_RIBBON_CONFIG_SETTING: 'sys_ux_ribbon_config_setting',
  TABLE_HEADER_CONFIG: 'sys_ux_m2m_workspace_header_ux_header_config',
  TABLE_PAGE_PROPERTY: 'sys_ux_page_property',
  TABLE_FORM_HEADER_SECONDARY_VALUES: 'sys_aw_form_header_secondary_values',

  // returns true if the table (or inherited parent tables) has a valid ribbon config
  queryRibbonConfig: function (table, sourceTables, ribbonConfigId) {
    var gr = new GlideRecord(this.TABLE_RIBBON_CONFIG_SETTING);
    gr.addQuery('configuration', ribbonConfigId);
    var grt = gr.addQuery('table', table);
    for (i = 0; i < sourceTables.length; i++) {
      if (sourceTables[i] != table)
        grt.addOrCondition('table', sourceTables[i]);
    }
    gr.addQuery('active', true);
    gr.addQuery('ribbon.active', true);
    gr.query();
    if (gr.next())
      return true;

    return false;
  },

  // returns true if there are any secondary values defined for the immediate table
  queryFormSecondaryValues: function (headerId) {
    var gr = new GlideRecord(this.TABLE_FORM_HEADER_SECONDARY_VALUES);
    gr.addQuery('active', true);
    gr.addQuery('form_header.sys_id', headerId);
    gr.query();
    if (gr.next())
      return true;

    return false;
  },

  // returns true if the table (or inherited parent tables) has a configured form headers
  querySecondaryValuesConfig: function (table, sourceTables, headerConfigId) {
    for (i = 0; i < sourceTables.length; i++) {
      var gr = new GlideRecord(this.TABLE_HEADER_CONFIG);
      gr.addQuery('header_config', headerConfigId);
      gr.addQuery('workspace_form_header.active', true);
      gr.addQuery('workspace_form_header.table', sourceTables[i]);
      gr.query();
      if (gr.next()) {
        var headerId = gr.getValue('workspace_form_header');
        return this.queryFormSecondaryValues(headerId);
      }
    }
    return false;
  },

  // returns page propery values used to configure the secondary values and ribbon on the record page
  queryPageProperties: function (pageId, ribbonLocationPropName, secondaryValuesLocationPropName) {
    var headerConfigId = '';
    var ribbonConfigId = '';
    var isSecondaryValueLocationSideBar = false;
    var isRibbonLocationSideBar = false;

    var gr = new GlideRecord(this.TABLE_PAGE_PROPERTY);
    gr.addQuery('page', pageId);
    gr.query();
    while (gr.next()) {
      if (gr.name == ribbonLocationPropName && gr.value == 'sidebar') {
        isRibbonLocationSideBar = true;
      } else if (gr.name == secondaryValuesLocationPropName && gr.value == 'sidebar') {
        isSecondaryValueLocationSideBar = true;
      } else if (gr.name == 'headerConfigId') {
        headerConfigId = gr.getValue('value');
      } else if (gr.name == 'ribbonConfigId') {
        ribbonConfigId = gr.getValue('value');
      }
    }

    return {
      ribbonConfigId: ribbonConfigId,
      headerConfigId: headerConfigId,
      isSecondaryValueLocationSideBar: isSecondaryValueLocationSideBar,
      isRibbonLocationSideBar: isRibbonLocationSideBar
    };
  },

  // determines if the record information sidebar page should be visible for the given page, table, and sys id
  shouldShowSidePanel: function (table, sysId, pageId, ribbonLocationPropName, secondaryValuesLocationPropName) {
    // these are optional parameters, if undefined set the default name
    if (typeof ribbonLocationPropName == 'undefined')
      ribbonLocationPropName = 'ribbonLocation';
    if (typeof secondaryValuesLocationPropName == 'undefined')
      secondaryValuesLocationPropName = 'record_secondary_values_location';

    var pageProperties = this.queryPageProperties(pageId, ribbonLocationPropName, secondaryValuesLocationPropName);
    var ribbonConfigId = pageProperties.ribbonConfigId;
    var headerConfigId = pageProperties.headerConfigId;
    var isSecondaryValueLocationSideBar = pageProperties.isSecondaryValueLocationSideBar;
    var isRibbonLocationSideBar = pageProperties.isRibbonLocationSideBar;

    // check if the current record is new
    if (sysId == -1)
      return false;

    // if both ribbon and secondary values are in the header, return false
    if (!isRibbonLocationSideBar && !isSecondaryValueLocationSideBar)
      return false;

    // retrieve the tables up the inheritance hierarchy
    var sourceTables = new GlideTableHierarchy(table).getTables();
    var hasRibbonConfig = this.queryRibbonConfig(table, sourceTables, ribbonConfigId);
    var hasSecondaryValuesConfig = this.querySecondaryValuesConfig(table, sourceTables, headerConfigId);

    if (isRibbonLocationSideBar && !isSecondaryValueLocationSideBar)
      return hasRibbonConfig;

    if (isSecondaryValueLocationSideBar && !isRibbonLocationSideBar)
      return hasSecondaryValuesConfig;

    // if either the ribbon or secondary configs are valid, return true
    return hasRibbonConfig || hasSecondaryValuesConfig;
  },

  type: 'FormHeaderRibbonUtil'
};
