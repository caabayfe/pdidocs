function include({
    imports
}) {
    class BenchmarksUtilsSNC {
        /**
         * Returns category dropdown data
         *@param {array} categoryIds
         *@param {object} categories
         * @return {object}
         */
        static async getCategoryDropdown(categories) {
            var categoriesDropDownData = [];
            for (var key in categories) {
                var category = {};
                category.id = key;
                category.label = categories[key];
                categoriesDropDownData.push(category);
            }
            return categoriesDropDownData;
        }

        /**
         * Returns cohort dropdown data
         *@param {object} breakdowns
         *@param {object} helpers
         * @return {object}
         */
        static async getCohortDropdown(breakdowns, helpers) {
            var cohortsIdLabelMap = {
                "sn_bm_company_similar": await helpers.translate("Similar companies"),
                "sn_bm_common_industry": await helpers.translate("Industry"),
                "sn_bm_common_size_bucket": await helpers.translate("Number of users"),
                "sn_bm_client_region": await helpers.translate("Region"),
                "sn_bm_client_msp": await helpers.translate("MSP Cohort")
            };
            var cohortsItems = [{
                "id": "all",
                "label": await helpers.translate("Compare with all"),
                "cohort": "all"
            }];
            for (var cohortId in cohortsIdLabelMap) {
                if (cohortsIdLabelMap.hasOwnProperty(cohortId)) {
                    var breakdown = breakdowns[cohortId];
                    if (breakdown) {
                        var breakdownIds = breakdown.idList;
                        var cohortItem = {
                            "id": cohortId,
                            "label": cohortsIdLabelMap[cohortId],
                            "children": []
                        };
                        for (var j = 0; j < breakdownIds.length; j++) {
                            var cohortChildren = {
                                "id": breakdownIds[j],
                                "label": await helpers.translate("Compare with {0}", breakdown.idMap[breakdownIds[j]].display),
                                "cohort": cohortId
                            };
                            cohortItem.children.push(cohortChildren);
                        }
                        cohortsItems.push(cohortItem);
                    }
                }
            }
            return cohortsItems;
        }

        /**
         * Returns current tabs
         *@param {object} groupIds
         *@param {object} groups
         * @return {object}
         */
        static async getCurrentTabs(groups, helpers) {
            var tabs = [{
                "id": "all",
                "label": await helpers.translate("All")
            }];
            for (var groupID in groups) {
                var tab = {
                    "id": groupID,
                    "label": groups[groupID]
                };
                tabs.push(tab);
            }
            return tabs;
        }

        /**
         * Returns indicators data
         *@param {string} category
         *@param {string} group
         *@param {object} cohort
         *@param {object} inputData
         * @return {object}
         */
        static async getCurrentFilteredData(group, inputData) {
            var indicatorList = [];
            if (group == "all") {
                indicatorList = inputData.indicators.idList;
            } else {
                var indicatorsMap = inputData.indicators.idMap;
                for (var key in indicatorsMap)
                    if (indicatorsMap[key].group === group)
                        indicatorList.push(key);
            }
            return this.getCurrentFilteredDataForIndicators(indicatorList, inputData);
        }

        static async getCurrentFilteredDataForIndicators(indicators, inputData) {
            var data = {
                "month": inputData ? inputData.currentMonth : "",
                "sizeBucket": inputData ? inputData.sizeBucket : "",
                "region": inputData ? inputData.region : "",
                "industry": inputData ? inputData.activeIndustry : "",
                "indicatorData": []
            };
            for (var i = 0; i < indicators.length; i++) {
                var indicatorId = indicators[i];
                var indicatorData = {
                    "id": indicatorId
                }
                if (indicatorId in inputData.indicators.idMap) {
                    var currentMonthScores = inputData.indicators.idMap[indicatorId].scores[inputData.currentMonth];
                    indicatorData.name = inputData.indicators.idMap[indicatorId].display;
                    indicatorData.minimize = inputData.indicators.idMap[indicatorId].minimize;
                    indicatorData.unit = inputData.indicators.idMap[indicatorId].unit;
                    indicatorData.localScore = currentMonthScores ? currentMonthScores.local : {};
                    indicatorData.globalScore = currentMonthScores ? currentMonthScores.global : {};
                    data.indicatorData.push(indicatorData);
                }
            }
            return data;
        }
        static async timeDifferenceConvert(difference, unit) {
            if (unit != 'd' && unit != 'h') {
                return parseFloat(difference.toFixed(2));
            }
            var time = difference;
            if (unit == 'd') {
                time = time * 24;
            }
            var days = Math.floor(time / 24);
            var remainder = time % 24;
            var hours = Math.floor(remainder);

            if (days === '0') {
                if (hours === '0') {
                    return remainder + ' h';
                } else {
                    return hours + ' h';
                }
            } else {
                if (hours === '0') {
                    return days + ' d';
                } else {
                    return days + ' d ' + hours + ' h';
                }
            }
        }

        static updateLocalGlobal(score) {
            var rt = {
                "local": {},
                "global": {}
            }
            for (let key in score)
                rt[key] = score[key];
            return rt;
        }


        /**
         * Returns Line chart data and units
         *@param {object} indicatorData
         *@param {array} monthsIdList
         *@param {string} selectedCohort
         * @return {array}
         */
        static async getVisualizationDataForSelectedIndicator(indicatorData, helpers) {
            var unit = {
                "precision": "",
                "fieldType": "",
                "label": "",
                "format": ""
            };
            var setUnitDetails = (precision, fieldType, label, format) => {
                unit.precision = precision;
                unit.fieldType = fieldType;
                unit.label = label;
                unit.format = format;
            }
            switch (indicatorData.unit) {
                case "":
                    setUnitDetails(0, "number", await helpers.translate("Count"), indicatorData.unit);
                    break;
                case "{0}%":
                    setUnitDetails(2, "decimal", await helpers.translate("Percentage"), indicatorData.unit);
                    break;
                case "{0} Hrs":
                    setUnitDetails(0, "number", await helpers.translate("Hours"), indicatorData.unit);
                    break;
                case "{0} days":
                    setUnitDetails(2, "number", await helpers.translate("Days"), indicatorData.unit);
                    break;
            }
            var data = {
                benchmarkSeries: [],
                instanceScoreSeries: [],
                top10PerformersSeries: []
            };
            for (let key in indicatorData.scores) {
                const timestamp = indicatorData.scores[key].timestamp;

                var monthlyScore = indicatorData.scores[key];
                monthlyScore = this.updateLocalGlobal(monthlyScore);

                //build series data for trend chart
                data.benchmarkSeries.push({
                    timestamp,
                    value: monthlyScore.global.mean || null
                });
                data.top10PerformersSeries.push({
                    timestamp,
                    value: monthlyScore.global.top10score || null
                });
                data.instanceScoreSeries.push({
                    timestamp,
                    value: monthlyScore.local.value || null
                });
            }

            const legend = [{
                header: await helpers.translate("Benchmarks"),
                series: "benchmarkSeries"
            },
            {
                header: await helpers.translate("Top Performers"),
                series: "top10PerformersSeries"
            },
            {
                header: await helpers.translate("Instance Score"),
                series: "instanceScoreSeries"
            }
            ];

            //combine chart data and metadata
            var trendLineData = legend.map(scoreType => ({
                data: data[scoreType.series],
                metadata: {
                    series: [{
                        label: scoreType.header,
                        id: "value",
                        type: "value"
                    }],
                    aggregate: {
                        fieldType: unit.fieldType
                    },
                    format: {
                        unitFormat: "{0}",
                        frequency: "monthly",
                        precision: unit.precision
                    },
                    dataSourceLabel: scoreType.header,
                    timeZone: 0
                }
            }));
            return [trendLineData, unit];
        }
        static async setDataForList(api, overviewDataList, pageIndex) {
            var pageSize = api.state.pageSizeListView;
            var startingIndex = pageIndex * pageSize;
            var rowLength = overviewDataList.rows.length;
            var endingIndex = (pageIndex + 1) * pageSize;
            if (rowLength < endingIndex) {
                endingIndex = rowLength;
            }
            var prevState = api.state.overviewDataListIndexed;
            var tempRows = overviewDataList.rows.slice(startingIndex, endingIndex);

            var temp = {};
            temp.rows = tempRows;

            api.setState("overviewDataListIndexed", temp);
        }

        static async sendData(result, categoryId, industry, breakdown, breakdowns, helpers) {
            var indicators = result.indicators;
            var months = result.months;
            var categories = result.categories;
            var translatedNA = await helpers.translate("N/A");
            const textSuccess = 'text-success';
            const textDanger = 'text-danger';

            async function getOurTrend(item, months, monthsMap, helpers) {
                return {
                    name: await helpers.translate('Your Instance & Percentile Rank'),
                    data: months.map(function (m) {
                        var theMonth = monthsMap[m];
                        return [
                            new Date(theMonth.year, theMonth.month - 1, 15).valueOf(),
                            (m in item.scores) ? item.scores[m].local.value : null
                        ];
                    }),
                    monthlyChange: months.map(function (m) {
                        return (m in item.scores) ? item.scores[m].local.monthlyChange : null;
                    })
                };
            }

            async function getTheirScore(item, bd, month, months, monthsMap, breakdowns, helpers, breakdownVar) {
                var translatedNA = await helpers.translate('N/A');
                var score = {
                    value: 0,
                    display: translatedNA,
                    percentile_rank: translatedNA,
                    valid: false,
                    top10scoreDisplay: translatedNA
                };
                var trend = {
                    name: '',
                    data: null
                };
                /* Check if a breakdown is selected */
                if (bd.type && bd.value) {
                    /* Set the trend name and data */
                    trend.data = months.map(function (m) {
                        var theMonth = monthsMap[m];
                        var value = null;
                        try {
                            value = item.scores[m].breakdowns[bd.type].elements[bd.value].mean;
                        } catch (err) { }
                        return [new Date(theMonth.year, theMonth.month - 1, 15).valueOf(), value];
                    });
                    /* Try to set the score values */
                    try {
                        /* Set the trend name */
                        trend.name = breakdownVar;
                        /* Set the score values */
                        var element = item.scores[month].breakdowns[bd.type].elements[bd.value];
                        score.value = element.mean;
                        score.display = element.display.toLowerCase();
                        score.top10scoreDisplay = element.top10scoreDisplay;
                        if (!!element.rank)
                            score.percentile_rank = element.rank;
                        score.valid = true;
                    } catch (err) { }
                } else {
                    /* Trend values */
                    trend.name = await helpers.translate('Global Benchmark');
                    trend.data = months.map(function (m) {
                        var theMonth = monthsMap[m];
                        var value = null;
                        try {
                            value = item.scores[m].global.mean;
                        } catch (err) { }
                        return [new Date(theMonth.year, theMonth.month - 1, 15).valueOf(), value];
                    });
                    try {
                        /* Set global score value */
                        score.value = item.scores[month].global.mean;
                        if (!!item.scores[month].global.rank)
                            score.percentile_rank = item.scores[month].global.rank;
                        /* Set global score display value */
                        if (!!item.scores[month].global.display) {
                            score.display = item.scores[month].global.display.toLowerCase();
                            score.top10scoreDisplay = item.scores[month].global.top10scoreDisplay;
                            score.valid = true;
                        }
                    } catch (err) { }
                }
                return {
                    score: score,
                    trend: trend
                };
            }
            async function getOurScore(item, month, prevMonth) {
                /* Function to check which direction the change is better */
                var isBetter = function (minimizeDirection, a, b) {
                    return (minimizeDirection) ? (a <= b) : (a >= b);
                };
                if (month in item.scores) {
                    item.ourScore = {
                        value: item.scores[month].local.value,
                        display: (!item.scores[month].local.display ? '0' : item.scores[month].local.display.toLowerCase())
                    };
                } else {
                    item.ourScore = {
                        value: null,
                        display: '0'
                    };
                }
                var display = item.ourScore.display;
                var replaceStr = '';
                if (item.ourScore.display.indexOf('days') != -1) {
                    replaceStr = 'days';
                } else if (item.ourScore.display.indexOf('day') != -1) {
                    replaceStr = 'day';
                } else if (item.ourScore.display.indexOf('d') != -1) {
                    replaceStr = 'd';
                }
                display = display.replace(replaceStr, '<span class="os-sm">' + replaceStr + '</span>').replace('%', '<span class="os-sm">%</span>');
                if (item.ourScore.display.indexOf('hours') != -1) {
                    replaceStr = 'hours';
                } else if (item.ourScore.display.indexOf('hour') != -1) {
                    replaceStr = 'hour';
                } else if (item.ourScore.display.indexOf('h') != -1) {
                    replaceStr = 'h';
                }
                item.ourScore.display = display.replace(replaceStr, '<span class="os-sm">' + replaceStr + '</span>');

                try {
                    var lastMonthValue = item.scores[prevMonth].local.value;
                    item.difference = parseInt(Math.abs((item.ourScore.value - lastMonthValue) / lastMonthValue).toFixed(2) * 100);
                    item.color = isBetter(item.minimize, item.ourScore.value, lastMonthValue) ? 'success' : 'danger';
                    item.direction = (item.ourScore.value < lastMonthValue) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';
                    if (isNaN(item.difference))
                        throw TypeError;
                } catch (err) {
                    var lastMonthValue = 0;
                    item.difference = 'NA';
                    item.color = 'grey';
                    item.direction = '';
                }
            }


            function getTextColor(item) {
                item.textColor = ((!item.minimize && item.ourScore.value >= item.theirScore.value) || (item.minimize && item.ourScore.value <= item.theirScore.value)) ? textSuccess : textDanger;
            };
            var category = categories.idMap[categoryId].display;
            var currentMonth = months.current[categoryId];
            indicators.idMap = indicators.idList.filter(function (id) {
                return indicators.idMap[id].category == categoryId;
            }).map(function (id) {
                return indicators.idMap[id];
            });
            var month = months.idMap[currentMonth].display;
            var breakdownVar = '';
            if (breakdown && breakdown.type && breakdown.value && breakdowns) {
                for (var i in breakdowns) {
                    if (breakdowns[i].id == breakdown.type)
                        for (var j in breakdowns[i].children) {
                            if (breakdowns[i].children[j].id == breakdown.value)
                                breakdownVar = breakdowns[i].children[j].label;
                        }
                }
            }
            var type = '';
            if (breakdown.type) {
                if (breakdown.type == 'sn_bm_common_industry')
                    type = await helpers.translate('Industry') + ' (';
                else if (breakdown.type == 'sn_bm_common_size_bucket')
                    type = await helpers.translate('Number of users') + ' (';
                else if (breakdown.type == 'sn_bm_client_region')
                    type = await helpers.translate('Region') + ' (';
            }
            var heading = '';
            var textbody = '';
            if (category)
                heading += category;
            if (month)
                textbody += await helpers.translate('Summary') + ': ' + month;
            if (industry)
                textbody += ' | ' + await helpers.translate('Your Industry') + ': ' + industry;
            var bracket = (type) ? ')' : '';
            if (breakdownVar)
                textbody += ' | ' + await helpers.translate('Compared with') + ': ' + type + '' + breakdownVar + bracket;
            var cells = [{
                'text': (await helpers.translate('KPI Name')).toUpperCase()
            },
            {
                'text': (await helpers.translate('Your Score')).toUpperCase()
            },
            {
                'text': (await helpers.translate('Monthly Change')).toUpperCase()
            },
            {
                'text': (await helpers.translate('Benchmark')).toUpperCase()
            },
            {
                'text': (await helpers.translate('Top Performers')).toUpperCase()
            },
            {
                'text': (await helpers.translate('Percentile Rank')).toUpperCase()
            }
            ];

            months.idList = months.idList.reverse();
            for (var id in indicators.idMap) {
                var kpiMonths = {
                    'idList': [],
                    'idMap': {}
                };
                kpiMonths.idList = months.idList.filter(function (month) {
                    return month in indicators.idMap[id].scores;
                });
                kpiMonths.idList.forEach(function (month) {
                    kpiMonths.idMap[month] = months.idMap[month];
                });
                indicators.idMap[id].ourTrend = await getOurTrend(indicators.idMap[id], kpiMonths.idList, kpiMonths.idMap, helpers);
                var result = await getTheirScore(indicators.idMap[id], breakdown, currentMonth, kpiMonths.idList, kpiMonths.idMap, breakdowns, helpers, breakdownVar);
                indicators.idMap[id].theirTrend = result.trend;
                indicators.idMap[id].theirScore = result.score;
                getOurScore(indicators.idMap[id], currentMonth, months.idMap[currentMonth].previous);
                getTextColor(indicators.idMap[id]);
                cells.push({
                    'text': (indicators && indicators.idMap[id] && indicators.idMap[id].display) ? indicators.idMap[id].display : ''
                });
                cells.push({
                    'text': (indicators && indicators.idMap[id] && indicators.idMap[id].ourScore.display) ? indicators.idMap[id].ourScore.display.replace(/<span.*?>/g, '').replace(/<\/span>/g, '') : '',
                    'color': (indicators && indicators.idMap[id] && indicators.idMap[id].textColor) ? indicators.idMap[id].textColor : ''
                });
                var difference = indicators.idMap[id].difference;
                difference = difference == 'NA' ? translatedNA : difference + '%';
                cells.push({
                    'text': difference,
                    'color': indicators.idMap[id].color == 'danger' ? textDanger : textSuccess
                });
                cells.push({
                    'text': (indicators && indicators.idMap[id] && indicators.idMap[id].theirScore && indicators.idMap[id].theirScore.display) ? indicators.idMap[id].theirScore.display.replace(/<span.*?>/g, '').replace(/<\/span>/g, '') : ''
                });
                cells.push({
                    'text': (indicators && indicators.idMap[id] && indicators.idMap[id].theirScore && indicators.idMap[id].theirScore.top10scoreDisplay) ? indicators.idMap[id].theirScore.top10scoreDisplay.replace(/<span.*?>/g, '').replace(/<\/span>/g, '') : ''
                });
                cells.push({
                    'text': result.score.percentile_rank
                });
            }
            var pages = [{
                'heading': heading,
                'textbody': textbody,
                'svg': '',
                'table': {
                    'cells': cells,
                    'column_widths': [0.3, 0.14, 0.14, 0.14, 0.14, 0.14]
                }
            }];
            for (var id in indicators.idMap) {
                var item = indicators.idMap[id];
                var kpiCells = [{
                    'text': (await helpers.translate('Month')).toUpperCase()
                },
                {
                    'text': item.theirTrend.name
                },
                {
                    'text': await helpers.translate('Top Performers Benchmark')
                },
                {
                    'text': await helpers.translate('Your Instance')
                },
                {
                    'text': await helpers.translate('Percentile Rank')
                }
                ];
                for (var m in months.idList) {
                    var ourScore = {
                        'value': 0,
                        'display': translatedNA
                    };
                    var theirScore = {
                        'value': 0,
                        'display': translatedNA
                    };
                    var top10score = {
                        'value': 0,
                        'display': translatedNA
                    };
                    try {
                        var selectedMonth = months.idList[m];
                        var bdType = breakdown.type;
                        var bdValue = breakdown.value;
                        if (!(selectedMonth in item.scores))
                            continue;
                        kpiCells.push({
                            'text': months.idList[m]
                        });
                        if (selectedMonth in item.scores &&
                            item.scores[selectedMonth].local.display)
                            ourScore = {
                                'value': item.scores[selectedMonth].local.value,
                                'display': item.scores[selectedMonth].local.display
                            };
                        if (breakdown && breakdown.value && breakdown.type) {
                            var score = item.scores[selectedMonth].breakdowns[bdType].elements[bdValue];
                            theirScore = {
                                'value': score.mean,
                                'display': score.display,
                                'rank': score.rank
                            };
                            top10score = {
                                'value': score.top10score,
                                'display': score.top10scoreDisplay
                            };
                        } else {
                            var globalScore = item.scores[selectedMonth].global;
                            if (globalScore.display) {
                                theirScore.value = globalScore.mean;
                                theirScore.display = globalScore.display;
                            }
                            if (globalScore.top10scoreDisplay) {
                                top10score.value = globalScore.top10score;
                                top10score.display = globalScore.top10scoreDisplay;
                            }
                            theirScore.rank = globalScore.rank;
                        }
                    } catch (err) { }
                    kpiCells.push({
                        'text': theirScore.display
                    });
                    kpiCells.push({
                        'text': top10score.display
                    });
                    var textClass = ((!item.minimize && ourScore.value >= theirScore.value) || (item.minimize && ourScore.value <= theirScore.value)) ? textSuccess : textDanger;
                    kpiCells.push({
                        'text': ourScore.display,
                        'color': textClass
                    });
                    kpiCells.push({
                        'text': theirScore.rank ?
                            theirScore.rank : translatedNA
                    });
                }
                var description = '';
                if (item.description) {
                    item.description.split("\n").forEach(function (line) {
                        if (line && line != '' && line != '\r')
                            description += '' + line.replace(/</g, '&lt;') + '\n';
                    });
                }
                pages.push({
                    'heading': '' + item.display,
                    'textbody': '' + description,
                    'svg': {
                        'content': '<svg> </svg>',
                        'position': 650
                    },

                    'table': {
                        'cells': kpiCells,
                        'column_widths': [0.2, 0.2, 0.2, 0.2, 0.2]
                    }
                });
            }
            var documentRecord = {
                'name': 'Benchmark Report ' + month,
                'date': {
                    'month': months.idMap[currentMonth].month,
                    'year': months.idMap[currentMonth].year
                },
                'breakdown': breakdown.type == 'all' ? '' : breakdown.type,
                'element': breakdown.value == 'all' ? '' : breakdown.value,
                //'element': '',
                'category': categoryId
            };
            var url = '/api/sn_bm_client/benchmark_client_api/export_pdf';
            var result = {
                'file_name': 'Benchmark Report ' + month,
                'pages': pages,
                'record': documentRecord
            };
            return result;
        }
    }
    return BenchmarksUtilsSNC;
}
