/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
  const {
    enableDotwalking = true,
    fieldInclusionList,
    fieldExclusionList,
    includeExcludedOperators,
    includeExtendedOperators,
  } = api.context.props;

  const { tableName, path, variableMode, requestType, params } = event.payload;

  const DYNAMIC_ATTRIBUTES = "DYNAMIC_ATTRIBUTES";
  const DYNAMIC_CATEGORIES = "DYNAMIC_CATEGORIES";

  if (
    requestType === DYNAMIC_ATTRIBUTES ||
    requestType === DYNAMIC_CATEGORIES
  ) {
    if (requestType === DYNAMIC_CATEGORIES) {
      api.data.predicate_builder_controller_fetch_panel_definitions_dynamic_categories.execute(
        {
          disableDotwalking: !enableDotwalking,
          fieldName: params.fieldName,
          searchTerm: params.searchTerm,
          tableName: params.tableName,
          firstRow: params.firstRow,
          lastRow: params.lastRow,
        }
      );
    } else if (requestType === DYNAMIC_ATTRIBUTES) {
      api.data.predicate_builder_controller_fetch_panel_definitions_dynamic_attributes.execute(
        {
          namespaceName: params.namespaceName,
          categoryNamespacedName: params.categoryNamespacedName,
          searchTerm: params.searchTerm,
          firstRow: params.firstRow,
          lastRow: params.lastRow,
        }
      );
    }
  } else {
    api.data.predicate_builder_controller_fetch_panel_definitions.execute({
      tableName,
      path,
      variableMode,
      disableDotwalking: !enableDotwalking,
      fieldInclusionList,
      fieldExclusionList,
      includeExcludedOperators,
      includeExtendedOperators,
    });
  }
}
