/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
            "aggregateField": "total_assists",
            "aggregateFunction": "AVG",
            "axisId": "primary",
            "dataSource": "dGFibGVzbl9lbnRpdGxlbWVudF9nZW5haV9hc3Npc3RfYW5hbHl0aWNzMTcwOTI0NDU2MDQzNw==",
            "id": "ZEdGaWJHVnpibDlsYm5ScGRHeGxiV1Z1ZEY5blpXNWhhVjloYzNOcGMzUmZZVzVoYkhsMGFXTnpNVGN3T1RJME5EVTJNRFF6Tnc9PTE3MDkyNDQ1NjQwODA=",
            "numberFormat": {
                "customFormat": true,
                "decimalPrecision": 0
            }
        },
        {
            "aggregateField": "total_purchase_count",
            "aggregateFunction": "AVG",
            "axisId": "primary",
            "dataSource": "dGFibGVzbl9lbnRpdGxlbWVudF9nZW5haV9hc3Npc3RfYW5hbHl0aWNzMTcwOTI0NTQ5NzI5NQ==",
            "id": "ZEdGaWJHVnpibDlsYm5ScGRHeGxiV1Z1ZEY5blpXNWhhVjloYzNOcGMzUmZZVzVoYkhsMGFXTnpNVGN3T1RJME5UUTVOekk1TlE9PTE3MDkyNDU1MDQwNzI=",
            "numberFormat": {
                "customFormat": true,
                "decimalPrecision": 0
            }
        }
    ];
}
