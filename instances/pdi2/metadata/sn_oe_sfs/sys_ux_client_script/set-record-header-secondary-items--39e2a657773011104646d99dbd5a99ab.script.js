/**
 * @param {api} params.api
 * @param {any} params.event
 */
function handler({api, event}) {
  const transformReferenceValue = (sourceItem) => {
   return Object.assign({}, sourceItem, {
      table: sourceItem.referenceItem.table,
      sysId: sourceItem.referenceItem.sysId,
      type: 'reference'
    });
  };

  const transformHighlightedValue = (sourceItem) => {
    return Object.assign({}, sourceItem, {
      status: sourceItem.highlightedValueStyle.status,
      showIcon: sourceItem.highlightedValueStyle.showIcon,
      type: 'highlighted'
    });
  };
  
  const transformSimpleValue = (sourceItem) => {
    return Object.assign({}, sourceItem, {
      type: 'simple'
    });
  };

  const loc = api.context.app.record_secondary_values_location;
  let secondaryItems = [];

  if (loc !== 'sidebar') {
    const sourceItems = event.payload.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.headerConfig.headerItems.secondaryItems;
    secondaryItems = sourceItems.map(item => {
      if (item.referenceItem !== null) {
        return transformReferenceValue(item);
      } else if (item.highlightedValueStyle !== null) {
        return transformHighlightedValue(item);
      } else {
        return transformSimpleValue(item);
      }
    });
  };

  api.setState('recordHeaderSecondaryItems', secondaryItems);
}
