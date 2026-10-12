
	// UI Policy for sn-component-filter component
	function policy(args) {
		"use strict";
var policy_export_var = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/scripted-policy/index.js
  var scripted_policy_exports = {};
  __export(scripted_policy_exports, {
    applyPolicies: () => applyPolicies
  });

  // ../filter/src/filter/constants.js
  var FILTER_LIST_MODE_SINGLE = "single";
  var FILTER_ELEMENT_TYPE_PILL = "pill";
  var FILTER_ELEMENT_TYPE_SELECTORS = "selectors";
  var FILTER_ELEMENT_TYPE_TYPEAHEAD = "typeahead";

  // ../../libraries/filter-common/src/groups/overrides.js
  var groupFilterOverrides = [
    {
      propName: "isShowSelectedValueInPill",
      configurable: true,
      value: (properties) => properties.showSelectedValuesInPill
    },
    {
      propName: "filterElementType",
      configurable: true,
      value: () => "pill"
    },
    {
      propName: "isGroup",
      configurable: false,
      value: () => true
    },
    {
      propName: "primaryActionLabel",
      configurable: true,
      value: (properties, t) => properties.showApply ? t("Confirm") : ""
    },
    {
      propName: "cascadeScope",
      configurable: false,
      value: (properties) => properties.cascadeScope
    },
    {
      propName: "isDashboard",
      configurable: false,
      value: (properties) => properties.isDashboard
    }
  ];
  function getOverriddenPropNames(configurableOnly = false) {
    return groupFilterOverrides.filter((override) => !configurableOnly || override.configurable).map((override) => override.propName);
  }

  // src/filter-connected/constants.js
  var prefix = "NOW_FILTER_CONNECTED";
  var NOW_FILTER_CONNECTED__APPLIED = `${prefix}#APPLIED`;
  var NOW_FILTER_CONNECTED__RESET_TO_DEFAULTS = `${prefix}#RESET_TO_DEFAULTS`;
  var NOW_FILTER_CONNECTED__CLEAR_FILTERS = `${prefix}#CLEAR_FILTERS`;
  var NOW_FILTER_CONNECTED__FETCH_FOLLOWING_FILTERS_ELEMENTS = `${prefix}#FETCH_FOLLOWING_FILTERS_ELEMENTS`;
  var NOW_FILTER_CONNECTED__FETCH_FOLLOWING_FILTERS_ELEMENTS_SUCCESSFUL = `${prefix}#FETCH_FOLLOWING_FILTERS_ELEMENTS_SUCCESSFUL`;
  var NOW_FILTER_CONNECTED__FETCH_FOLLOWING_FILTERS_ELEMENTS_ERROR = `${prefix}#FETCH_FOLLOWING_FILTERS_ELEMENTS_ERROR`;
  var NOW_FILTER_CONNECTED__FETCH_BOOTSTRAP_INFO = `${prefix}#FETCH_BOOTSTRAP_INFO`;
  var NOW_FILTER_CONNECTED__FETCH_BOOTSTRAP_INFO_SUCCESSFUL = `${prefix}#FETCH_BOOTSTRAP_INFO_SUCCESSFUL`;
  var NOW_FILTER_CONNECTED__FETCH_BOOTSTRAP_INFO_ERROR = `${prefix}#FETCH_BOOTSTRAP_INFO_ERROR`;
  var NOW_FILTER_CONNECTED__FILTER_PROPS_ADDED_TO_SHARED_PROPS = `${prefix}#FILTER_PROPS_ADDED_TO_SHARED_PROPS`;
  var FILTER_COMPONENT_TYPE_MULTISELECT = "multiselect";
  var FILTER_COMPONENT_TYPE_SINGLESELECT = "singleselect";
  var FILTER_COMPONENT_TYPE_DATE = "date";
  var FILTER_COMPONENT_TYPE_BOOLEAN = "boolean";

  // src/helpers/isDateFilter.js
  var isDateFilter = (fieldType) => {
    if (typeof fieldType !== "string") {
      return false;
    }
    return fieldType.includes("date") || fieldType === "glide_precise_time";
  };

  // src/filter-connected/helpers/migrate-props.js
  function getTableField(sourceTablefield) {
    const field = sourceTablefield.field;
    const table = sourceTablefield.table;
    if ((field == null ? void 0 : field.type) === "reference") {
      return {
        table: String(field.reference)
      };
    }
    return {
      table: table.id,
      field: field.id
    };
  }
  var datasourceOrTargetNeedsMigration = (config) => config && Object.keys(config).length !== 0 && !config.payload;
  var needsMigration = (properties) => {
    return properties.filterProperties || datasourceOrTargetNeedsMigration(properties.datasource) || (properties.targets || []).some(datasourceOrTargetNeedsMigration);
  };
  var migrateDatasourceOrTarget = (config) => {
    var _a, _b;
    if ((config == null ? void 0 : config.type) === "table" && config.table) {
      return {
        type: config.type,
        payload: {
          table: config.table.id,
          field: (_a = config.field) == null ? void 0 : _a.id,
          primaryKey: config.primaryKey,
          ...config.table.hierarchy ? { applyToHierarchy: true } : {},
          ...((_b = config.field) == null ? void 0 : _b.type) ? { fieldType: config.field.type } : {}
          // needed for cascading filters
        },
        encodedQuery: config.encodedQuery,
        emptyOption: config.emptyOption,
        choices: config.choices
      };
    } else if ((config == null ? void 0 : config.type) === "pa" && config.breakdown) {
      return {
        type: "indicator",
        payload: {
          breakdown: config.breakdown.sysId,
          isChoiceType: config.breakdown.isOfChoiceType,
          targetTable: config.breakdown.targetTable,
          factsTable: config.breakdown.factsTable,
          field: config.breakdown.field
        },
        encodedQuery: config.encodedQuery,
        emptyOption: config.emptyOption,
        choices: config.choices
      };
    }
    return config;
  };
  function migrateProperties(filterProps, migrateFilterConfigurations = true) {
    var _a, _b, _c, _d, _e;
    if (!needsMigration(filterProps)) {
      return filterProps;
    }
    if (filterProps.filterProperties) {
      const oldProps = JSON.parse(filterProps.filterProperties);
      const listMode = oldProps.listMode;
      const tablefields = Array.isArray(oldProps.tablefields) && oldProps.tablefields;
      const sourceTablefield = tablefields ? tablefields[0] : void 0;
      const fieldType = (_a = sourceTablefield == null ? void 0 : sourceTablefield.field) == null ? void 0 : _a.type;
      let filterComponentType;
      if (isDateFilter(fieldType)) {
        filterComponentType = FILTER_COMPONENT_TYPE_DATE;
      } else if (fieldType === "boolean") {
        filterComponentType = FILTER_COMPONENT_TYPE_BOOLEAN;
      } else if (sourceTablefield) {
        if (listMode === FILTER_LIST_MODE_SINGLE) {
          filterComponentType = FILTER_COMPONENT_TYPE_SINGLESELECT;
        } else {
          filterComponentType = FILTER_COMPONENT_TYPE_MULTISELECT;
        }
      }
      const isChoiceFilter = filterComponentType === FILTER_COMPONENT_TYPE_SINGLESELECT || filterComponentType === FILTER_COMPONENT_TYPE_MULTISELECT;
      const newProps = {
        filterId: filterProps.filterId || filterProps.nowId,
        filterName: filterProps.filterName,
        filterCustomId: filterProps.filterCustomId,
        filterComponentType,
        datasource: isChoiceFilter && sourceTablefield ? {
          type: "table",
          choices: oldProps.choices,
          encodedQuery: oldProps.encodedQuery,
          emptyOption: oldProps.emptyOption,
          payload: {
            ...getTableField(sourceTablefield)
          }
        } : void 0,
        targets: tablefields ? tablefields.map((tf) => ({
          type: "table",
          payload: {
            table: tf.table.id,
            field: tf.field.id
          }
        })) : [],
        defaultSelectedItems: isChoiceFilter && Array.isArray(oldProps.defaults) ? oldProps.defaults : void 0,
        defaultBoolean: filterComponentType === FILTER_COMPONENT_TYPE_BOOLEAN && Array.isArray(oldProps.defaults) && oldProps.defaults.length > 0 ? oldProps.defaults[0].id : void 0,
        defaultDateStart: filterComponentType === FILTER_COMPONENT_TYPE_DATE && !Array.isArray(oldProps.defaults) ? (_b = oldProps == null ? void 0 : oldProps.defaults) == null ? void 0 : _b.start : void 0,
        defaultDateEnd: filterComponentType === FILTER_COMPONENT_TYPE_DATE && !Array.isArray(oldProps.defaults) ? (_c = oldProps == null ? void 0 : oldProps.defaults) == null ? void 0 : _c.end : void 0,
        sort: oldProps.sort || "ASC",
        // DEF0366807: sort property has default value null for Pre-Utah filter
        booleanLabelTrue: (_d = oldProps.booleanLabels) == null ? void 0 : _d.trueLabel,
        booleanLabelFalse: (_e = oldProps.booleanLabels) == null ? void 0 : _e.falseLabel,
        enableClearFilter: oldProps.enableClearFilter,
        enableResetToDefault: oldProps.enableResetToDefault,
        primaryActionLabel: filterProps.primaryActionLabel,
        maxElements: oldProps.maxElements,
        isShowSelectedValueInPill: filterProps.isShowSelectedValueInPill,
        filterElementType: filterProps.filterElementType,
        filterElementLayout: filterProps.filterElementLayout
      };
      if (migrateFilterConfigurations) {
        newProps.filterConfigurations = filterProps.filterConfigurations;
      }
      return newProps;
    }
    return {
      ...filterProps,
      datasource: migrateDatasourceOrTarget(filterProps.datasource),
      targets: (filterProps.targets || []).map(migrateDatasourceOrTarget)
    };
  }

  // src/scripted-policy/index.js
  function isCascadingSupported(datasource) {
    return (datasource == null ? void 0 : datasource.type) === "table" || (datasource == null ? void 0 : datasource.type) === "indicator";
  }
  function getDateFilterView(properties) {
    const dateFilterView = properties.dateFilterView;
    return (dateFilterView == null ? void 0 : dateFilterView.message) || dateFilterView;
  }
  function isDatePropertyVisible(propertyName, properties) {
    var _a;
    const { filterComponentType } = properties;
    const isDateFilter2 = filterComponentType === FILTER_COMPONENT_TYPE_DATE;
    if (!isDateFilter2) {
      return false;
    }
    const isCustomDaterangeSelected = getDateFilterView(properties) === "calendar-reldates" && !((_a = properties.defaultSelectedDateRange) == null ? void 0 : _a.range);
    const displayStartAndEndDate = isDateFilter2 && (isCustomDaterangeSelected || getDateFilterView(properties) === "calendar-only");
    const shouldShowRanges = isDateFilter2 && getDateFilterView(properties) !== "calendar-only";
    switch (propertyName) {
      case "dateFilterView":
        return isDateFilter2;
      case "defaultDateStart":
      case "defaultDateEnd":
      case "allowTimeSelection":
        return displayStartAndEndDate;
      case "parfilterdefaultrange":
      case "parfilterdateranges":
        return shouldShowRanges;
      default:
        console.error(`Unknown date configuration property '${propertyName}'`);
        return false;
    }
  }
  function isAnyDefaultValueSelected(properties) {
    const { filterComponentType } = properties;
    switch (filterComponentType) {
      case FILTER_COMPONENT_TYPE_BOOLEAN:
        return Boolean(properties.defaultBoolean);
      case FILTER_COMPONENT_TYPE_DATE:
        return Boolean(properties.defaultDateStart && properties.defaultDateEnd || properties.defaultSelectedDateRange && properties.defaultSelectedDateRange.range);
      case FILTER_COMPONENT_TYPE_SINGLESELECT:
      case FILTER_COMPONENT_TYPE_MULTISELECT:
        return Array.isArray(properties.defaultSelectedItems) && properties.defaultSelectedItems.length > 0;
      default:
        return true;
    }
  }
  function updateForDynamicProperties({ api }) {
    api.updateVisibility("filterProperties", true);
    api.updateVisibility("filterComponentType", false);
    api.updateSectionVisibility("dataSection", false);
    api.updateSectionVisibility("advancedOptionsSection", false);
    api.updateSectionVisibility("cascadingFilter", false);
  }
  function updateSectionsVisibility({ api, properties }) {
    const { filterComponentType, datasource } = properties;
    const isTypeSelected = Boolean(filterComponentType);
    api.updateSectionVisibility("dataSection", isTypeSelected);
    api.updateSectionVisibility("advancedOptionsSection", isTypeSelected);
    api.updateSectionVisibility("cascadingFilter", isCascadingSupported(datasource));
  }
  function updateProperties({ api, properties, trigger }) {
    let { filterComponentType } = properties;
    if (!filterComponentType) {
      filterComponentType = "singleselect";
      properties.filterComponentType = filterComponentType;
      api.updateValue("filterComponentType", filterComponentType);
      api.updateValue("isShowSelectedValueInPill", true);
      api.updateValue("enableClearFilter", true);
    } else {
      api.updateValue("isShowSelectedValueInPill", Boolean(properties.isShowSelectedValueInPill));
    }
    const isChoiceType = filterComponentType === FILTER_COMPONENT_TYPE_SINGLESELECT || filterComponentType === FILTER_COMPONENT_TYPE_MULTISELECT;
    api.updateVisibility("parfilterds", isChoiceType);
    api.updateVisibility("parfilterdefault", isChoiceType);
    api.updateVisibility("maxElements", isChoiceType);
    api.updateVisibility("sort", !["date", "boolean"].includes(filterComponentType));
    const filterElementType = isChoiceType ? properties.filterElementType : FILTER_ELEMENT_TYPE_PILL;
    api.updateValue("filterElementType", filterElementType);
    const isFilterPill = !filterElementType || filterElementType === FILTER_ELEMENT_TYPE_PILL;
    const isFilterCheckboxes = filterElementType === FILTER_ELEMENT_TYPE_SELECTORS && filterComponentType === FILTER_COMPONENT_TYPE_MULTISELECT;
    const isFilterRadiobuttons = filterElementType === FILTER_ELEMENT_TYPE_SELECTORS && filterComponentType === FILTER_COMPONENT_TYPE_SINGLESELECT;
    const isBooleanType = filterComponentType === FILTER_COMPONENT_TYPE_BOOLEAN;
    api.updateVisibility(
      "enableResetToDefault",
      (isFilterPill || isFilterCheckboxes || isFilterRadiobuttons) && isAnyDefaultValueSelected(properties) && !isBooleanType
    );
    api.updateVisibility("enableClearFilter", isFilterPill && !isBooleanType);
    api.updateVisibility("primaryActionLabel", (isFilterPill || isFilterCheckboxes) && !isBooleanType);
    api.updateVisibility("filterProperties", api.isDynamic("filterProperties"));
    if (trigger === "filterComponentType" && filterComponentType !== "multiselect" && filterComponentType !== "singleselect") {
      api.updateValue("targets", []);
      api.updateValue("datasource", {});
    }
    if (trigger === "filterComponentType" || trigger === "datasource") {
      api.updateValue("defaultSelectedItems", []);
    }
  }
  function updateForUnconfiguredDatasource({ api, properties }) {
    var _a;
    const isUnconfigured = (properties.filterComponentType === FILTER_COMPONENT_TYPE_SINGLESELECT || properties.filterComponentType === FILTER_COMPONENT_TYPE_MULTISELECT) && !((_a = properties.datasource) == null ? void 0 : _a.type) && !api.isDynamic("datasource");
    if (isUnconfigured) {
      api.updateVisibility("parfilterdefault", false);
      api.updateVisibility("parfilterdtargets", false);
      api.updateSectionVisibility("advancedOptionsSection", false);
      api.updateSectionVisibility("cascadingFilter", false);
    }
  }
  function updateUiElementSection({ api, properties }) {
    const { filterComponentType } = properties;
    const isSingleSelect = filterComponentType === FILTER_COMPONENT_TYPE_SINGLESELECT;
    const isMultiSelect = filterComponentType === FILTER_COMPONENT_TYPE_MULTISELECT;
    const isSelectorElement = (isSingleSelect || isMultiSelect) && properties.filterElementType === FILTER_ELEMENT_TYPE_SELECTORS;
    const isTypeaheadSelected = isMultiSelect && properties.filterElementType === FILTER_ELEMENT_TYPE_TYPEAHEAD;
    api.updateVisibility("filterElementType", isSingleSelect || isMultiSelect);
    api.updateVisibility("isShowSelectedValueInPill", !(isSelectorElement || isTypeaheadSelected));
    api.updateVisibility("filterElementLayout", isSelectorElement);
    if (isSingleSelect || isMultiSelect) {
      const choices = [
        { label: "Pill", value: "pill" },
        ...isSingleSelect ? [
          { label: "Radio buttons", value: "selectors" }
        ] : [
          { label: "Checkboxes", value: "selectors" },
          { label: "Typeahead", value: "typeahead" }
        ]
      ];
      api.updateTypeMetadata("filterElementType", "choices", choices);
    }
  }
  function updateForDateComponentType({ api, properties }) {
    const { filterComponentType } = properties;
    const isDateFilter2 = filterComponentType === FILTER_COMPONENT_TYPE_DATE;
    const { defaultDateStart, defaultDateEnd } = properties;
    if (defaultDateStart && defaultDateEnd && defaultDateStart > defaultDateEnd) {
      api.updateValue("defaultDateStart", defaultDateEnd);
      api.updateValue("defaultDateEnd", defaultDateStart);
    }
    if (isDateFilter2 && (!properties.defaultSelectedDateRange || !isDatePropertyVisible("parfilterdefaultrange", properties))) {
      api.updateValue("defaultSelectedDateRange", { range: "" });
    }
    api.updateVisibility("dateFilterView", isDatePropertyVisible("dateFilterView", properties));
    api.updateVisibility("parfilterdefaultrange", isDatePropertyVisible("parfilterdefaultrange", properties));
    api.updateVisibility("parfilterdateranges", isDatePropertyVisible("parfilterdateranges", properties));
    const resettableFields = ["defaultDateStart", "defaultDateEnd", "allowTimeSelection"];
    resettableFields.forEach((field) => {
      if (isDatePropertyVisible(field, properties)) {
        api.updateVisibility(field, true);
      } else {
        properties[field] && api.updateValue(field, void 0);
        api.updateVisibility(field, false);
      }
    });
    if (isDateFilter2) {
      api.updateSectionVisibility("cascadingFilter", false);
    }
  }
  function updateForTrueFalseComponentType({ api, properties }) {
    var _a, _b;
    const { filterComponentType } = properties;
    const isBooleanFilter = filterComponentType === FILTER_COMPONENT_TYPE_BOOLEAN;
    api.updateVisibility("defaultBoolean", isBooleanFilter);
    api.updateVisibility("booleanLabelTrue", isBooleanFilter);
    api.updateVisibility("booleanLabelFalse", isBooleanFilter);
    if (isBooleanFilter) {
      const booleanDefaultChoices = [
        { label: "", value: "" },
        { label: ((_a = properties.booleanLabelTrue) == null ? void 0 : _a.message) || properties.booleanLabelTrue || "True", value: "true" },
        { label: ((_b = properties.booleanLabelFalse) == null ? void 0 : _b.message) || properties.booleanLabelFalse || "False", value: "false" }
      ];
      api.updateTypeMetadata("defaultBoolean", "choices", booleanDefaultChoices);
      api.updateSectionVisibility("cascadingFilter", false);
    }
  }
  function updateDataSourceMetadata({ api, properties }) {
    const filterComponentType = properties.filterComponentType || FILTER_COMPONENT_TYPE_SINGLESELECT;
    api.updateInterfaceMetadata("parfilterds", "filterComponentType", filterComponentType);
    api.updateInterfaceMetadata("parfilterds", "targets", properties.targets);
  }
  function updateCascadingMetadata({ api, properties }) {
    api.updateInterfaceMetadata("parfiltercascading", "datasource", properties.datasource);
    api.updateInterfaceMetadata("parfiltercascading", "targets", properties.targets);
    api.updateInterfaceMetadata("parfiltercascading", "filterId", properties.filterId);
    api.updateInterfaceMetadata("parfiltercascading", "cascadeScope", properties.cascadeScope);
    api.updateInterfaceMetadata("parfiltercascading", "filterElementType", properties.filterElementType || FILTER_ELEMENT_TYPE_PILL);
  }
  function updateTargetsMetadata({ api, properties }) {
    api.updateInterfaceMetadata("parfilterdtargets", "filterComponentType", properties.filterComponentType);
    api.updateInterfaceMetadata("parfilterdtargets", "datasource", properties.datasource);
  }
  function updateDefaultsMetadata({ api, properties }) {
    api.updateInterfaceMetadata("parfilterdefault", "filterComponentType", properties.filterComponentType);
    api.updateInterfaceMetadata("parfilterdefault", "datasource", properties.datasource);
    api.updateInterfaceMetadata("parfilterdefault", "maxElements", properties.maxElements);
    api.updateInterfaceMetadata("parfilterdefaultrange", "dateFilterView", getDateFilterView(properties));
    api.updateInterfaceMetadata("parfilterdefaultrange", "allowedDateRanges", properties.allowedDateRanges);
  }
  function updateForGroupedFilter({ api, properties }) {
    const { isGroup = false } = properties;
    const propsToUpdate = getOverriddenPropNames(true);
    propsToUpdate.forEach((propName) => api.updateEnabled(propName, !isGroup));
  }
  function applyPolicies({ api, properties: notMigratedProperties, trigger }) {
    api.updateVisibility("filterId", false);
    let filterId = notMigratedProperties.filterId;
    if (!filterId) {
      filterId = Date.now().toString(32) + Math.random().toString(32).substring(2);
      api.updateValue("filterId", filterId);
    }
    if (api.isDynamic("filterProperties")) {
      updateForDynamicProperties({ api, properties: notMigratedProperties, trigger });
      return;
    }
    api.updateVisibility("filterProperties", false);
    api.updateVisibility("filterComponentType", true);
    const properties = migrateProperties(notMigratedProperties, false);
    if (properties !== notMigratedProperties) {
      for (const [key, value] of Object.entries(properties)) {
        if (notMigratedProperties[key] !== value) {
          api.updateValue(
            /** @type {any} */
            key,
            value
          );
        }
      }
      api.updateValue("filterProperties", null);
    }
    api.updateVisibility("parfilterdtargets", true);
    updateProperties({ api, properties, trigger });
    updateSectionsVisibility({ api, properties, trigger });
    updateForUnconfiguredDatasource({ api, properties, trigger });
    updateUiElementSection({ api, properties, trigger });
    updateForDateComponentType({ api, properties, trigger });
    updateForTrueFalseComponentType({ api, properties, trigger });
    updateDataSourceMetadata({ api, properties, trigger });
    updateTargetsMetadata({ api, properties, trigger });
    updateDefaultsMetadata({ api, properties, trigger });
    updateCascadingMetadata({ api, properties, trigger });
    updateForGroupedFilter({ api, properties, trigger });
  }
  return __toCommonJS(scripted_policy_exports);
})();

		policy_export_var.applyPolicies(args);
	}
	
