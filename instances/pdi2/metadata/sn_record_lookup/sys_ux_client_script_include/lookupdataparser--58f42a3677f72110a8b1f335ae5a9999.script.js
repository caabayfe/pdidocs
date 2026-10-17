function include({ imports }) {
  const parseLookupData = (rowData, fields, showEmptyValues, emptyFieldValue, highlightedValues) => {
    //preprocess highlighted Values
    const hasHighlightedValues = highlightedValues && highlightedValues.length > 0;
    const highlightedValuesMap = {};
    if (hasHighlightedValues) {
      highlightedValues.forEach(hv => {
        highlightedValuesMap[hv.field] = {
          type: 'highlighted-value',
          label: hv.value,
          color: hv.colorName,
          variant: hv.variantName,
          showIcon: hv.showIcon,
          icon: hv.iconName,
          status: hv.status
        };
      });
    }

    const parsedLookupData = fields.map(field => {
      let fieldData = getDotWalkedValue(field, rowData);

      if (!fieldData)
        return null;

      //highlighted values takes precedence
      if (hasHighlightedValues && fieldData.field in highlightedValuesMap) {
        return {
          label: fieldData.label,
          value: highlightedValuesMap[fieldData.field]
        };
      }

      switch (fieldData.internalType) {
        case 'ph_number': case 'phone_number_e164':
          return {
            label: fieldData.label,
            value: fieldData.value ? {
              linkType: 'phone',
              label: fieldData.value,
              type: 'text-link',
              href: 'javascript:void(0)'
            } : getEmptyFieldEntry(showEmptyValues, emptyFieldValue)
          };
        case 'reference':
          return {
            label: fieldData.label,
            value: fieldData.value ? {
              linkType: 'reference',
              label: fieldData.displayValue,
              value: fieldData.value,
              referenceTable: fieldData.referenceTable || extractReferenceTableName(fieldData.__typename),
              type: 'text-link',
              href: 'javascript:void(0)'
            } : getEmptyFieldEntry(showEmptyValues, emptyFieldValue)
          };
        case 'email':
          return {
            label: fieldData.label,
            value: fieldData.value ? {
              linkType: 'email',
              label: fieldData.value,
              type: 'text-link',
              href: 'javascript:void(0)'
            } : getEmptyFieldEntry(showEmptyValues, emptyFieldValue)
          };
        default:
          return {
            label: fieldData.label,
            value: fieldData.value ? fieldData.displayValue : (showEmptyValues ? emptyFieldValue : null),
            type: 'string'
          };
      }
    }).filter(e => !!(e && e.value));
    return parsedLookupData;
  };

  function getEmptyFieldEntry(showEmptyValues, emptyFieldValue) {
    return showEmptyValues ? {
      label: emptyFieldValue,
      value: emptyFieldValue,
      type: 'string'
    } : null;
  }

  function getDotWalkedValue(field, data) {
    // Return null if field is of formatter type, which is only supported in U16 and earlier
    if (field.includes(".xml")) {
      return null;
    }

    // Return fieldData if field is not dot-walked
    if (!field.includes(".") || data._isAdvancedSearch) {
      return { field, ...data[field] };
    }

    // Build key path into data object from dot-walked field path
    const keyPath = field.split('.').join('._reference.').split('.');
    // Find the nested value in the object using the key path
    const value = keyPath.reduce((dataObject, key) => {
      return dataObject[key];
    }, data);
    return { field, ...value };
  }

  function extractReferenceTableName(__typename) {
    //e.x For 'Caller' field on incident record, __typename returns as 'GlideRecord_ReferenceFieldType_sys_user'
    return __typename.replace('GlideRecord_ReferenceFieldType_', '');
  }

  return ({ parseLookupData });
}
