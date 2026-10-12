/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
  const {
        isExpanded,
        key,
        groupIdsException
    } = event.payload;
  const { table, tableMetadata } = api.data.sn_record_list_data_broker.out;
  const nestBy = api.context.props.nestBy;
  const metadata = tableMetadata || {};
  api.data.sn_record_list_data_broker.groupsToggled({ groupKeys: [key], isExpanded });
  if (metadata && metadata.isGrouped && !nestBy) {
        const groupByColumn = metadata.groupedColumn;
      // Remove duplicates
      var updatedArray = Array.from(new Set(groupIdsException));
      var updatedPreferenceValue = updatedArray.join(',');

      api.data.save_user_preference.execute({
          name: `workspace.list.${table}.groupBy.${groupByColumn}.exceptions`,
          value:  updatedPreferenceValue
      });
    }
}
