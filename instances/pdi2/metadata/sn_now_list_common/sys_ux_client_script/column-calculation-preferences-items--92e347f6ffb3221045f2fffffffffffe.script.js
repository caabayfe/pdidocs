/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api,event, helpers}) {
  const { column: columnKey } = api.context.props;
  const { columns = [] } = api.data.controller.columnDefinitions || {};
  const column = columns.find(({ key }) => key === columnKey);
  if (!column) return [];

  const { columnAggregatesInfo = [] } = column.metadata || {};
  
  return columnAggregatesInfo.map(({ id, label, isSelected }) => ({
    itemId: id,
    label,
    checked: isSelected,
  }));
}
