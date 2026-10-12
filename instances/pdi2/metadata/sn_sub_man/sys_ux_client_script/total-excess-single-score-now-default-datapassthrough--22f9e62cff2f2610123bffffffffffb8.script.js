/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const cloudFormatData = {
                    "frequency": "daily",
                    "precision": 2,
                    "unitFormat": "{0}"
                };

    const creatorAndAssistData = {
                    "frequency": "daily",
                    "precision": 0,
                    "unitFormat": "{0}",
                    "abbreviationEnabled": false,
                    "decimalSeparator": ".",
                    "thousandSeparatorEnabled": true,
                    "rounding": "DOWN",
                    "groupingSeparator": ",",
                }

    const data = [{
            "data": [{
                "change": "0",
                "changePercent": "0",
                "value": api.context.props.templateInput.totalExcessScoreData
            }],
            "metadata": {
                "aggregate": {
                    "fieldType": "decimal"
                },
                "changeArrow": "steady",
                "dataSourceLabel": "",
                "eventData": {
                    "indicatorSysid": ""
                },
                "filterQuery": "",
                "format": api.context.props.templateInput.flow === "cloudCapacity" ? cloudFormatData : creatorAndAssistData,
                "previousScoreDate": "",
                "scoreDate": ""
            }
        }];
    return data;
}
