/**
 * @param {params} params
 * @param {api} params.api
 */
function handler({api}) {
  const transformHighlightValue = (item) => {
    return {
      type: 'highlighted-value',
      label: item.displayValue,
      status: item.status,
      showIcon: item.showIcon,
      icon: item.iconName,
      color: item.colorName,
      variant: item.variantName
    };
  };

  const transformStringValue = (item) => {
    return {
      type: 'string',
      value: item.displayValue
    };
  };

  const transformTextLinkValue = (item) => {
    return {
      type: 'text-link',
      label: item.displayValue,
      href: 'javascript:void(0)',
      table: item.table,
      sysId: item.sysId
    };
  };

  const headerItems = api.context.props.recordSecondaryItems;
  const displayBlockItems = headerItems.map(item => {
    const { fieldLabel, type } = item;
    let displayBlockItemValue = {};

    switch (type) {
      case 'simple':
        displayBlockItemValue = transformStringValue(item);
        break;
      case 'reference':
        displayBlockItemValue = transformTextLinkValue(item);
        break;
      case 'highlighted':
        displayBlockItemValue = transformHighlightValue(item);
        break;
      default:
        // noop - empty object
        break;
    }

    return {
      label: fieldLabel,
      value: displayBlockItemValue
    };
  });

  api.setState('displayBlockItems', displayBlockItems);
}
