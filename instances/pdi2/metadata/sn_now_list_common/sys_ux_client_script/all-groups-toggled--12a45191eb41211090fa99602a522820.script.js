/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const {
        isExpanded
    } = event.payload;
  const { table, tableMetadata } =  api.data.sn_record_list_data_broker.out;
  const metadata = tableMetadata || {};
  api.data.sn_record_list_data_broker.groupsToggled(event.payload);
  if (metadata && metadata.isGrouped) {
        const groupByColumn = metadata.groupedColumn;
        api.data.save_user_preference.execute({
            name: `workspace.list.${table}.groupBy.${groupByColumn}.defaultAsOpen`,
            value:  isExpanded
        });
        api.data.save_user_preference.execute({
          name: `workspace.list.${table}.groupBy.${groupByColumn}.exceptions`,
          value:  ''
        });
    }
}
