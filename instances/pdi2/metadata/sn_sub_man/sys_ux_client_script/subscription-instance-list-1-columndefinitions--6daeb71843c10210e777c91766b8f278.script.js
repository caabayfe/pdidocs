/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const columns =
[
      {
        "key": "instance",
        "label": "Instance",
        "type": "string",
        "display": null,
        "numberFormat": null,
        "dateTimeFormat": null,
        "opensInNew": null,
        "locale": null,
        "currency": null,
        "timeZone": null,
        "metadata": {
          "isFilterable": true,
          "isGroupable": true,
          "isSortable": true,
          "isSorted": false,
          "isChoice": false,
          "internalType": "string",
          "excludedOperators": [],
          "referenceDisplayName": null,
          "isFiltered": false
        },
        "icons": {
          "endIcons": []
        }
      },
      {
        "key": "instance_type",
        "label": "Instance type",
        "type": "string",
        "display": null,
        "numberFormat": null,
        "dateTimeFormat": null,
        "opensInNew": null,
        "locale": null,
        "currency": null,
        "timeZone": null,
        "metadata": {
          "isFilterable": true,
          "isGroupable": true,
          "isSortable": true,
          "isChoice": false,
          "internalType": "string",
          "excludedOperators": [],
          "referenceDisplayName": null,
          "isFiltered": false
        },
        "icons": {
          "endIcons": []
        }
      },
      {
        "key": "instance_purpose",
        "label": "Instance purpose",
        "type": "string",
        "display": null,
        "numberFormat": null,
        "dateTimeFormat": null,
        "opensInNew": null,
        "locale": null,
        "currency": null,
        "timeZone": null,
        "metadata": {
          "isFilterable": true,
          "isGroupable": true,
          "isSortable": true,
          "isChoice": false,
          "internalType": "string",
          "excludedOperators": [],
          "referenceDisplayName": null,
          "isFiltered": false
        },
        "icons": {
          "endIcons": []
        }
      },
      {
        "key": "last_updated",
        "label": "Last updated",
        "type": "dateTime",
        "display": null,
        "numberFormat": null,
        "dateTimeFormat": "yyyy-MM-dd",
        "opensInNew": null,
        "locale": null,
        "currency": null,
        "timeZone": "Asia/Kolkata",
        "metadata": {
          "isFilterable": true,
          "isGroupable": false,
          "isSortable": true,
          "isChoice": false,
          "internalType": "glide_date",
          "excludedOperators": [],
          "referenceDisplayName": null,
          "isFiltered": false
        },
        "icons": {
          "endIcons": []
        }
      },     
      {
        "key": "used_capacity",
        "label": "Used capacity (TB)",
        "type": "number",
        "display": null,
        "numberFormat": "integer",
        "dateTimeFormat": null,
        "opensInNew": null,
        "locale": null,
        "currency": null,
        "timeZone": null,
        "metadata": {
          "isFilterable": true,
          "isGroupable": true,
          "isSortable": true,
          "isChoice": false,
          "internalType": "integer",
          "excludedOperators": [],
          "referenceDisplayName": null,
          "isFiltered": false
        },
        "icons": {
          "endIcons": []
        }
      },
       {
        "key": "included_capacity",
        "label": "Included capacity (TB)",
        "type": "number",
        "display": null,
        "numberFormat": "integer",
        "dateTimeFormat": null,
        "opensInNew": null,
        "locale": null,
        "currency": null,
        "timeZone": null,
        "metadata": {
          "isFilterable": true,
          "isGroupable": true,
          "isSortable": true,
          "isChoice": false,
          "internalType": "integer",
          "excludedOperators": [],
          "referenceDisplayName": null,
          "isFiltered": false
        },
        "icons": {
          "endIcons": []
        }
      },
      {
        "key": "used_pool_capacity",
        "label": "Used pool capacity (TB)",
        "type": "number",
        "display": null,
        "numberFormat": "integer",
        "dateTimeFormat": null,
        "opensInNew": null,
        "locale": null,
        "currency": null,
        "timeZone": null,
        "metadata": {
          "isFilterable": true,
          "isGroupable": true,
          "isSortable": true,
          "isSorted": true,
          "isDescending": true,
          "isChoice": false,
          "internalType": "integer",
          "excludedOperators": [],
          "referenceDisplayName": null,
          "isFiltered": false
        },
        "icons": {
          "endIcons": []
        }
      }
    ];
    if (api.data.get_customer_account_details_1.output.capacityType === 'Dedicated') {
      columns.splice(4,2);
    }

    return {
        "columns": columns,
        "columnHeaderTextTooltip": "Sort"
    };
}
