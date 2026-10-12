/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
  "columns": [
    {
      "key": "product_code",
      "label": "Product Code",
      "type": "link",
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
      "cellActions": [
        {
          "id": "show_matching",
          "label": "Show Matching",
          "action": "LIST_CTRL#SHOW_MATCHING_CLICKED"
        },
        {
          "id": "filter_out",
          "label": "Filter Out",
          "action": "LIST_CTRL#FILTER_OUT_CLICKED"
        }
      ],
      "columnHeaderActions": [],
      "icons": {
        "endIcons": []
      }
    },
    {
      "key": "name",
      "label": "Name",
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
        "isSorted": true,
        "isDescending": false,
        "isFiltered": false
      },
      "cellActions": [
        {
          "id": "show_matching",
          "label": "Show Matching",
          "action": "LIST_CTRL#SHOW_MATCHING_CLICKED"
        },
        {
          "id": "filter_out",
          "label": "Filter Out",
          "action": "LIST_CTRL#FILTER_OUT_CLICKED"
        }
      ],
      "columnHeaderActions": [],
      "icons": {
        "endIcons": [
          {
            "value": "caret-up-fill"
          }
        ]
      }
    },
    {
      "key": "start_date",
      "label": "Start date",
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
      "cellActions": [
        {
          "id": "show_matching",
          "label": "Show Matching",
          "action": "LIST_CTRL#SHOW_MATCHING_CLICKED"
        },
        {
          "id": "filter_out",
          "label": "Filter Out",
          "action": "LIST_CTRL#FILTER_OUT_CLICKED"
        }
      ],
      "columnHeaderActions": [],
      "icons": {
        "endIcons": []
      }
    },
    {
      "key": "end_date",
      "label": "End date",
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
      "cellActions": [
        {
          "id": "show_matching",
          "label": "Show Matching",
          "action": "LIST_CTRL#SHOW_MATCHING_CLICKED"
        },
        {
          "id": "filter_out",
          "label": "Filter Out",
          "action": "LIST_CTRL#FILTER_OUT_CLICKED"
        }
      ],
      "columnHeaderActions": [],
      "icons": {
        "endIcons": []
      }
    },
    {
      "key": "purchased_quantity",
      "label": "Quantity",
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
      "cellActions": [
        {
          "id": "show_matching",
          "label": "Show Matching",
          "action": "LIST_CTRL#SHOW_MATCHING_CLICKED"
        },
        {
          "id": "filter_out",
          "label": "Filter Out",
          "action": "LIST_CTRL#FILTER_OUT_CLICKED"
        }
      ],
      "columnHeaderActions": [],
      "icons": {
        "endIcons": []
      }
    },
    {
      "key": "storage_capacity",
      "label": "Capacity per unit (TB)",
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
      "cellActions": [
        {
          "id": "show_matching",
          "label": "Show Matching",
          "action": "LIST_CTRL#SHOW_MATCHING_CLICKED"
        },
        {
          "id": "filter_out",
          "label": "Filter Out",
          "action": "LIST_CTRL#FILTER_OUT_CLICKED"
        }
      ],
      "columnHeaderActions": [],
      "icons": {
        "endIcons": []
      }
    }
  ],
  "columnHeaderTextTooltip": "Sort"
};
}
