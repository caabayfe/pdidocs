/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        Findings: findings
    } = api.data.fetch_promin_findings_3.output.data.GlidePromin_Query;

    // If an error occured, or something, then ignore the next
    if (!findings)
        return;

     if (findings.length > 0) {
           api.setState("chartsHidden", false);
     }
     
    if (findings.length == 0) {
        api.setState("categoriesHidden", true);
        api.setState("categoriesEmptyStateHidden", false);
    }
    const newOpportunities = findings.filter(item => item.findingState?.toUpperCase() == "NEW");
    const inProgressOpportunities = findings.filter(item => item.findingState?.toUpperCase() == "UNDER_REVIEW");
    api.setState("opportunitiesHeading", await helpers.translate("{0} opportunities ({1} New + {2} Under Review)", findings.length, newOpportunities.length, inProgressOpportunities.length));

    //data transformation for % of opportunities by category
    const categoryConfig = {
        "Automation": {
            "icon": "square-loop-fill",
            "iconColor": "cdc9bbff9f5c73001bb9baac757fcf20",
        },
        "Quality": {
            "icon": "gem-outline",
            "iconColor": "10fea73f9f5c73001bb9baac757fcfd9",
        },
        "Conformance": {
            "icon": "clipboard-check-outline",
            "iconColor": "df8f511cb7733010b288bc16de11a9b4",

        },
        "Performance": {
            "icon": "chart-speedometer-outline",
            "iconColor": "9802ff7f9f5c73001bb9baac757fcf7d",

        },
        "Custom": {
            "icon": "circle-ellipsis-outline",
            "iconColor": "65b3029aa9fe3dba00b7c1d249afab80",

        }
    };

    async function getChartCategory(config, value, category) {
        return {
            "Data": [{
                "data": [{
                    "value": value
                }],
                "metadata": {
                    "dataSourceLabel": await helpers.translate(category),
                    "format": {
                        "unitFormat": "{0}%",
                        "frequency": "daily",
                        "precision": 0
                    }
                }
            }],
            "Icon": config.icon,
            "Colors": {
                "type": "singleColor",
                "values": [{
                    "color": "65b30218a9fe3dba0120df8611520d97",
                    "iconColor": config.iconColor,
                    "metric": "metric_0",
                    "rules": []
                }]
            }
        };
    }

    const categoryCount = findings.reduce((acc, item) => {
        if (!item.categoryLabel)
            return acc;

        if (acc[item.categoryLabel]) {
            acc[item.categoryLabel] += 1;
        } else {
            acc[item.categoryLabel] = 1;
        }
        return acc;
    }, {});

    // generate category description
    const categoryDescription = findings.reduce((acc, item) => {
        if (!item.categoryLabel)
            return acc;

        if (!categoryConfig[item.categoryLabel] && !acc[item.categoryLabel]) {
            acc[item.categoryLabel] = item.categoryDescription;
        }

        return acc;
    }, {});


    const categoryDescriptionData = Object.entries(categoryDescription).map((item) => {
        return {
            "category": item[0],
            "categoryDescription": item[1],
            "icon": "circle-ellipsis-outline",
        };
    });
    api.setState("categoryDescriptionData", categoryDescriptionData);
    api.setState("showAutomationDescription", findings.filter((item) => item.categoryLabel === "Automation").length > 0 ? false : true);
    api.setState("showConformanceDescription", findings.filter((item) => item.categoryLabel === "Conformance").length > 0 ? false : true);
    api.setState("showPerformanceDescription", findings.filter((item) => item.categoryLabel === "Performance").length > 0 ? false : true);
    api.setState("showQualityDescription", findings.filter((item) => item.categoryLabel === "Quality").length > 0 ? false : true);

    const total = findings.length;
    const categoryPercents = Object.entries(categoryCount).reduce((acc, item) => {
        acc[item[0]] = (item[1] / total) * 100;
        return acc;
    }, {});
    
    /* round down numbers so [98.88, .56, .56] becomes [98, 0, 0],
    than you sort descending based on the decimals, divide up the diff based on the decimal, 
    so biggest decimal will get the diff.
    */

    const rounded= Object.entries(categoryPercents).map((x, i) => ({number: Math.floor(x[1]), decimal: x[1]%1, index: i , category:x[0]}));
    const decimalSorted= [...rounded].sort((a,b)=> b.decimal-a.decimal);
    const sum = rounded.reduce((pre, curr)=> pre + curr.number, 0) ;
    const error= 100-sum;
    for (let i = 0; i < error; i++) {
        decimalSorted[i].number++;
    }
    const result= [...decimalSorted].sort((a,b)=> a.index-b.index);
    const categoryPercent = result.reduce((acc, item) => {
        acc[item.category] = item.number;
        return acc;
    }, {});
    const categoryPercentSorted = Object.entries(categoryPercent)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r,
            [k]: v
        }), {});

    const CategoryResult = [];
    for (let key in categoryPercentSorted) {
        if (categoryConfig[key]) {
            getChartCategory(categoryConfig[key], categoryPercentSorted[key], key).then(res => CategoryResult.push(res));
        } else {
            getChartCategory(categoryConfig["Custom"], categoryPercentSorted[key], key).then(res => CategoryResult.push(res));
        }

    }
    api.setState('chartCategoryData', CategoryResult);

    // data transformation for Top 5 opportunity types by # Records

    function generateChartsData(data, elements) {
        return [{
            "data": data,
            "metadata": {
                "groupBy": [{
                    "series": [{
                        "id": "value",
                        "type": "value",
                    }],
                    "elements": elements,
                    "id": "assignmentGroup",
                    "fieldType": "reference",
                    "label": "assignmentGroup"
                }],
                "format": {
                    "unitFormat": "{0}"
                }
            }
        }];
    }

    const noRecordsByType = findings.reduce((acc, item) => {
        if (!item.typeLabel)
            return acc;

        if (acc[item.typeLabel]) {
            acc[item.typeLabel] += item.frequency;
        } else {
            acc[item.typeLabel] = item.frequency;
        }
        return acc;
    }, {});

    const noRecordsByTypeSorted = Object.entries(noRecordsByType)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r,
            [k]: v
        }), {});

    const noRecordsByTypeData = Object.entries(noRecordsByTypeSorted).map((item) => {
        return {
            "assignmentGroup": item[0],
            "value": item[1]
        };
    }).slice(0, 5);

    const noRecordsByTypeElements = Object.entries(noRecordsByTypeSorted).map((item) => {
        return {
            "label": item[0],
            "defaultColor": "10, 184, 217"
        };
    }).slice(0, 5);

    const noRecordsByTypeResult = generateChartsData(noRecordsByTypeData, noRecordsByTypeElements);
    api.setState('noOfRecordsByTypeResult', noRecordsByTypeResult);

    //data transformation for Top 3 KPIs by # records & opportunities
    async function getChartInsightsByKPI(data, insightsElements, recordsElements, kpisElements) {
        return [{
            "data": data,
            "metadata": {
                "groupBy": [{
                        "label": await helpers.translate("# opportunities"),
                        "elements": insightsElements,
                        "id": "noInsights",
                        "fieldType": "integer"
                    },
                    {
                        "label": await helpers.translate("# records"),
                        "elements": recordsElements,
                        "id": "noRecords",
                        "fieldType": "number"
                    },
                    {
                        "label": await helpers.translate("KPI"),
                        "elements": kpisElements,
                        "id": "KPI",
                        "fieldType": "reference"
                    }
                ],
                "format": {
                    "unitFormat": "{0}"
                }
            }
        }];
    }
    const InsightsByKPI = findings.reduce((acc, item) => {
        if (item.impactedKpis.length == 0) {
            return acc;
        }
        item.impactedKpis.forEach((kpi) => {
            if (acc[kpi.name]) {
                acc[kpi.name] = {
                    "noRecords": item.caseIds.concat(acc[kpi.name].noRecords),
                    "noInsights": acc[kpi.name].noInsights + 1,
                    "KPI": kpi.label
                };
            } else {
                acc[kpi.name] = {
                    "noRecords": item.caseIds,
                    "noInsights": 1,
                    "KPI": kpi.label
                };
            }
        });
        return acc;
    }, {});
    
    if(Object.values(InsightsByKPI).length > 0){
        const insightsByKPIData = Object.values(InsightsByKPI).map((item) => {
            return { ...item,
                "noRecords": [...new Set(item.noRecords)].length
            };
        }).map((item) => {
            return { ...item,
                "value": item.noRecords * item.noInsights
            };
        }).sort((a, b) => b.value - a.value).slice(0, 3);

        const noInsightsElements = insightsByKPIData.map((item) => {
            return {
                "label": item.noInsights,
                "id": item.noInsights
            };
        });

        const noRecordsElements = insightsByKPIData.map((item) => {
            return {
                "label": item.noRecords,
                "id": item.noRecords
            };
        });

        const kpiElements = insightsByKPIData.map((item, i) => {
            return {
                "label": item.KPI
            };
        });
        
        getChartInsightsByKPI(insightsByKPIData, noInsightsElements, noRecordsElements, kpiElements).
        then((insightsByKPIResult) => {
            api.setState('insightsByKPIResult', insightsByKPIResult);
        });
}
}
