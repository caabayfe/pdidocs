var BenchmarkScoreUtil = Class.create();
BenchmarkScoreUtil.prototype = {
    initialize: function() {
        this.MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(function(m) {
            if (m === 'January')
                return gs.getMessage('January');
            if (m === 'February')
                return gs.getMessage('February');
            if (m === 'March')
                return gs.getMessage('March');
            if (m === 'April')
                return gs.getMessage('April');
            if (m === 'May')
                return gs.getMessage('May');
            if (m === 'June')
                return gs.getMessage('June');
            if (m === 'July')
                return gs.getMessage('July');
            if (m === 'August')
                return gs.getMessage('August');
            if (m === 'September')
                return gs.getMessage('September');
            if (m === 'October')
                return gs.getMessage('October');
            if (m === 'November')
                return gs.getMessage('November');
            if (m === 'December')
                return gs.getMessage('December');
        });
        this.timeKPIs = ['0391c5c56703220097eeff5557415a00', '682283c26732220097eeff5557415a58', '9eed2e223b603200b90c4bb534efc4d2', 'e03c66223b603200b90c4bb534efc48e', 'e0d279be6753220097eeff5557415a1a'];

        this.breakdownRecordSysIDs = {
            industry: '53a08d31775323000f7a72f9691061eb',
            sizeBucket: '0af48d31775323000f7a72f9691061d6',
            region: '06258171775323000f7a72f969106117',
            msp: '65f5c5b1775323000f7a72f969106158',
            companySimilar: '390044d2c305511033f41fec5440dd7e'
        };
    },

    getOptIn: function() {
        var gr = new GlideRecord('sn_bm_client_configuration');
        if (gr.get('name', 'opt_in_status'))
            return gr.getValue('value') === 'true';
        return false;
    },

    getCategoryByRoles: function(categories) {
        var idList = [];
        categories.idList.forEach(function(id) {
            var roles = categories.idMap[id].roles.filter(gs.hasRole);
            var allowed = categories.idMap[id].roles.length === 0 ||
                roles.length > 0 ||
                gs.hasRole('sn_bm_client.benchmark_admin');
            if (allowed)
                idList.push(id);
        });
        return idList;
    },
    // possible inputs to script - 
    //category -if category is provided, directly call getActiveGlobalIndicatorsByCategory else call getOrderedCategoryByRoles
    //breakdown - if breakdown is provided, pass this as argument to getScoreByIndicators function 
    // if indicator ID is provided, add this to indicatorsList and pass this as argument to getScoreByIndicators function - do not start flow from getOrderedCategoryByRoles
    getOrderedCategoryByRoles: function() {
        var gr = new GlideRecord('sn_bm_common_indicator_category');
        gr.orderBy('order');
        gr.query();
        var result = {};
        while (gr.next()) {
            var roles = [];
            if (gr.getValue('view_roles'))
                roles = gr.getValue('view_roles').split(',');
            var allowed = roles.length === 0 ||
                gs.hasRole('sn_bm_client.benchmark_admin') || roles.filter(gs.hasRole).length > 0;
            if (allowed) {
                var indicatorGr = new GlideAggregate('sn_bm_common_indicator');
                indicatorGr.addAggregate('COUNT');
                indicatorGr.addQuery('active', 'true');
                indicatorGr.addQuery('generate_global_scores', 'true');
                indicatorGr.addQuery('category', gr.getUniqueValue());
                indicatorGr.query();
                if (indicatorGr.next() && indicatorGr.getAggregate('COUNT') > 0)
                    result[gr.getUniqueValue()] = gr.getDisplayValue('name');
            }
        }
        return result;
    },
    getOrderedGroups: function(groupList) {
        var groupGr = new GlideRecord('sn_bm_common_indicator_group');
        groupGr.addQuery('sys_id', 'IN', groupList.join(','));
        groupGr.orderBy('order');
        groupGr.query();
        var result = {};
        while (groupGr.next())
            result[groupGr.getUniqueValue()] = groupGr.getDisplayValue('name');
        return result;
    },
    getActiveGlobalIndicatorsByCategory: function(category) {
        var gr = new GlideRecord('sn_bm_common_indicator');
        gr.addQuery('active', 'true');
        gr.addQuery('generate_global_scores', 'true');
        if (category)
            gr.addQuery('category', category);
        gr.query();
        var indicatorsList = [];
        while (gr.next())
            indicatorsList.push(gr.getUniqueValue());
        return indicatorsList;
    },
    updateResultWithScore: function(gr, result) {
        var monthObj = this.getMonthDisplay(gr.start_date);
        var month = monthObj.display;
        var indicator = gr.indicator + '';
        var unitFormat = gr.indicator.indicator.unit.format + '';
        var unitLabel = gr.indicator.indicator.unit.name.toString();
        if (this.timeKPIs.indexOf(indicator) > -1) {
            if (gs.getProperty('sn_bm_client.dashboard_display_unit') === 'days') {
                unitFormat = "{0} days";
                unitLabel = gs.getMessage("Days");
            } else {
                unitFormat = "{0} Hrs";
                unitLabel = gs.getMessage("Hours");
            }
        }
        if (!(indicator in result.indicators.idMap)) {
            result.indicators.idList.push(indicator);
            result.indicators.idMap[indicator] = {
                minimize: parseInt(gr.indicator.indicator.direction) !== 3,
                display: gr.getDisplayValue('indicator'),
                sys_id: indicator,
                startDate: gr.start_date + '',
                unit: unitFormat,
                unitName: unitLabel,
                scores: {},
                group: gr.indicator.group + '',
                category: gr.indicator.category + '',
                aggregation: gr.indicator.aggregation + '',
                pa_indicator: gr.indicator.indicator + '',
                description: gr.indicator.indicator.description + '',
            };
        }
        var isLocal = ('false' === gr.global.toString());
        var hasBreakdown = !gs.nil(gr.breakdown_reference);
        var resultObj = result.indicators.idMap[indicator];
        resultObj.scores[month] = resultObj.scores[month] ? resultObj.scores[month] : {};
        var timestamp = new Date(monthObj.year, monthObj.month - 1, 1, 0, 0, 0, 0);
        resultObj.scores[month].timestamp = timestamp.getTime();
        if (isLocal) {
            resultObj.scores[month].local = this.getLocalValues(gr, indicator, resultObj.unit);
            return;
        }
        // If this is a global score, put it in scores.global
        else if (!isLocal) {
            resultObj.scores[month].global = this.getGlobalValues(gr, indicator, resultObj.unit);
        }
    },
    getScoreForTrend: function(indicator, breakdown_value) {
        var months_ago = 6;
        var isPAPremium = GlidePluginManager.isActive('com.snc.pa.premium');
        if (isPAPremium)
            months_ago = 24;
        var dateRange = this.getRangeForKpi(months_ago, indicator);
        if (!isPAPremium) {
            // limit the query to last 6 months
            var thresholdDate = new GlideDateTime(gs.beginningOfLastMonth());
            thresholdDate.addMonthsUTC(-5);
            if (dateRange.start.compareTo(thresholdDate.getLocalDate()) < 0)
                dateRange.start = thresholdDate.getLocalDate();
        }
        var results = {};
        results.indicators = {};
        results.groups = [];
        results.indicators.idList = [indicator];
        results.indicators.idMap = {};
        var gr = new GlideRecord('sn_bm_client_score');
        gr.addQuery('indicator', indicator);
        if (breakdown_value == '') {
            gr.addQuery('element', '');
            gr.addQuery('breakdown_type', '');
        }
        gr.addQuery('start_date', '>=', dateRange.start);
        // gr.addQuery('end_date', '<=', dateRange.end);
        gr.orderBy('end_date');
        gr.query();
        while (gr.next()) {
            results.currentMonth = this.getMonthDisplay(gr.start_date).display;
            if (breakdown_value == '') {
                this.updateResultWithScore(gr, results);
            } else {
                if (gr.getValue('element') == null && gr.getValue('breakdown_type') == null && gr.getValue('global') == 0)
                    this.updateResultWithScore(gr, results);
                if (gr.getValue('element') == breakdown_value || (breakdown_value + "" == "true" && gr.getValue('bool_element') == 1))
                    this.updateResultWithScore(gr, results);
            }
        }
        return results;
    },
    getScoreByIndicators: function(indicatorsList, breakdown_value, startDate, endDate) {
        var results = {};
        results.indicators = {};
        results.groups = {};
        results.indicators.idList = [];
        results.indicators.idMap = {};
        var gr = new GlideRecord('sn_bm_client_score');
        gr.addQuery('indicator', 'IN', indicatorsList.join(','));
        if (breakdown_value == '') {
            gr.addQuery('element', '');
            gr.addQuery('breakdown_type', '');
        }
        if (startDate)
            gr.addQuery('start_date', '>=', startDate);
        if (endDate)
            gr.addQuery('end_date', '<', endDate);
        gr.orderByDesc('end_date');
        gr.orderByDesc('global');
        gr.query();
        var latestMonth = 0;
        var groupList = [];
        while (gr.next()) {
            if (latestMonth == 0) {
                latestMonth = this.getMonth(gr.getValue('start_date'));
                results.currentMonth = this.getMonthDisplay(gr.getValue('start_date')).display;
            } else if (latestMonth != this.getMonth(gr.getValue('start_date')))
                continue;
            if (breakdown_value == '') {
                this.updateResultWithScore(gr, results);
            } else {
                if (gr.getValue('element') == null && gr.getValue('breakdown_type') == null && gr.getValue('global') == 0)
                    this.updateResultWithScore(gr, results);
                if (gr.getValue('element') == breakdown_value || (breakdown_value + "" == "true" && gr.getValue('bool_element') == 1))
                    this.updateResultWithScore(gr, results);
            }
            groupList.push(gr.indicator.group + '');
        }
        results.groups = this.getOrderedGroups(groupList);
        return results;
    },
    getLocalValues: function(gr, indicator, unit) {
        var mean = parseFloat(parseFloat(gr.getValue('mean_value')).toFixed(2));
        var rt = {};
        rt.value = mean;
        if (this.timeKPIs.indexOf(indicator) > -1)
            rt.value = this.getUnitFormattedValue(mean);
        rt.display = this.getDisplayNumber(gr, mean, unit);
        rt.v2_score = gr.getValue('v2_score') === '1';
        return rt;
    },
    getGlobalValues: function(gr, indicator, unit) {
        var mean = parseFloat(parseFloat(gr.getValue('mean_value')).toFixed(2));
        var median = parseFloat(parseFloat(gr.getValue('median_value')).toFixed(2));
        var top10score = parseFloat(parseFloat(gr.getValue('mean_value_top10_percent')).toFixed(2));
        var rank = gr.percentile_rank.toString();
        var rankDisplay = gs.nil(rank) ? gs.getMessage('N/A') : rank;
        var rt = {};
        rt.mean = mean;
        rt.median = median;
        rt.top10score = top10score;
        if (this.timeKPIs.indexOf(indicator) > -1) {
            rt.mean = this.getUnitFormattedValue(mean);
            rt.top10score = this.getUnitFormattedValue(top10score);
        }
        rt.display = this.getDisplayNumber(gr, mean, unit);
        rt.top10scoreDisplay = this.getDisplayNumber(gr, top10score, unit);
        rt.rank = rankDisplay;
        return rt;

    },
    getDisplayNumber: function(gr, value, unit) {
        var floorValue = Math.round(value);
        if (!isNaN(value)) {
            if (gr.indicator.indicator.unit.name.toString() === 'Hours') {
                return this.getDisplayValue(floorValue);
            }
            var format = unit.length ? unit : '{0}';
            return (format.replace('{0}', value));
        }
        return gs.getMessage('N/A');
    },
    getBreakdowns: function() {
        var result = {};
        var dateRange = this.getRange(6);
        var breakdownMap = {};
        var gr = new GlideAggregate('sn_bm_client_score');
        gr.addQuery('start_date', '>=', dateRange.start);
        gr.addQuery('end_date', '<=', dateRange.end);
        gr.query();

        while (gr.next()) {
            var breakdown = gr.getValue('breakdown_table');
            var breakdown_type = gr.getValue('breakdown_type');
            var element = null;

            if (breakdown_type === 'reference')
                element = gr.getValue('element');
            else if (breakdown_type === 'boolean')
                element = gr.getValue('bool_element');

            if (breakdown == 'sn_bm_company_similar') {
                breakdown_type = 'boolean';
            }

            if (!gs.nil(element)) {
                if (breakdown_type === 'reference') {
                    var breakdownDetails = {};
                    if (!breakdownMap[breakdown] || !breakdownMap[breakdown][element]) {
                        var breakdownGR = new GlideRecord(breakdown);

                        if (!breakdownGR.get(element))
                            continue;
                        else {
                            breakdownDetails = {
                                displayValue: breakdownGR.getDisplayValue(),
                                lower: breakdownGR.isValidField('lower') ? breakdownGR.getValue('lower') : undefined,
                                value: breakdownGR.isValidField('value') ? breakdownGR.getValue('value') : undefined
                            };
                            if (!breakdownMap[breakdown])
                                breakdownMap[breakdown] = {};
                            breakdownMap[breakdown][element] = breakdownDetails;
                        }
                    } else
                        breakdownDetails = breakdownMap[breakdown][element];

                    if (!(breakdown in result))
                        result[breakdown] = {
                            idList: [],
                            idMap: {},
                            orderMap: {}
                        };

                    if (element in result[breakdown].idMap)
                        continue;

                    result[breakdown].idList.push(element);
                    result[breakdown].idMap[element] = {
                        'display': breakdownDetails.displayValue
                    };
                    if (!gs.nil(breakdownDetails.lower))
                        result[breakdown].orderMap[element] = parseInt(breakdownDetails.lower);
                    else if (!gs.nil(breakdownDetails.value))
                        result[breakdown].orderMap[element] = breakdownDetails.value;
                } else if (breakdown_type === 'boolean') {
                    if (breakdown == 'sn_bm_company_similar') {
                        breakdown_type = 'reference';
                    }
                    var bref = gr.getValue('breakdown_reference');
                    var display;
                    if (bref === this.breakdownRecordSysIDs.msp) {
                        breakdown = 'sn_bm_client_msp';

                        if (element === 'true')
                            display = gs.getMessage('MSP');
                        else if (element === 'false')
                            display = gs.getMEssage('Non-MSP');

                    } else if (bref === this.breakdownRecordSysIDs.companySimilar) {
                        breakdown = 'sn_bm_company_similar';
                        display = gs.getMessage('Your Industry and User Size');
                    } else
                        continue;

                    if (!(breakdown in result))
                        result[breakdown] = {
                            idList: [],
                            idMap: {},
                            orderMap: {}
                        };

                    if (element in result[breakdown].idMap)
                        continue;

                    result[breakdown].idList.push(element);
                    result[breakdown].idMap[element] = {
                        'display': display
                    };
                    result[breakdown].orderMap[element] = element;
                }
            }
        }
        return result;
    },

    getMonthOffset: function(startDate, monthOffset) {
        var date = new GlideDateTime(startDate);
        var month = date.getMonthUTC();
        var year = date.getYearUTC();

        var newYear = year;
        var newMonth = month + monthOffset;
        if (newMonth < 1) {
            newMonth = this.MONTHS.length - 1;
            newYear -= 1;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }

        return this.MONTHS[newMonth] + " " + newYear;
    },
    getMonth: function(startDate) {
        var date = new GlideDateTime(startDate);
        return date.getMonthUTC();
    },
    getMonthDisplay: function(startDate) {
        var date = new GlideDateTime(startDate);
        var month = date.getMonthUTC();
        var year = date.getYearUTC();

        return {
            display: (month > 0 && month <= 12) ? (this.MONTHS[month] + " " + year) : "",
            previous: this.getMonthOffset(startDate, -1),
            next: this.getMonthOffset(startDate, 1),
            month: month,
            year: year
        };
    },

    getActiveIndustry: function() {
        var gr = new GlideRecord('sn_bm_client_company_history');
        gr.orderByDesc('active_from');
        gr.query();
        while (gr.next() && 'true' === gr.active.toString()) {
            return gr.element.name + '';
        }
        return "";
    },

    getRange: function(monthsAgo) {
        var dateRange = new sn_bm_common.Utils().getMonthsAgoDates(monthsAgo);
        var gr = new GlideRecord('sn_bm_common_indicator_category');
        gr.query();
        while (gr.next()) {
            var category = gr.getValue('sys_id');
            var date = this.getRangeForCategory(monthsAgo, category);
            if (dateRange.start.compareTo(date.start) > 0)
                dateRange.start = date.start;
            if (dateRange.end.compareTo(date.end) < 0)
                dateRange.start = date.end;
        }
        return dateRange;
    },

    getRangeForCategory: function(monthsAgo, category) {
        return this.getRangeForCategoryAndKpi(monthsAgo, category, null);
    },

    getRangeForKpi: function(monthsAgo, kpi) {
        return this.getRangeForCategoryAndKpi(monthsAgo, null, kpi);
    },

    getRangeForCategoryAndKpi: function(monthsAgo, category, kpi) {
        var dateRange = new sn_bm_common.Utils().getMonthsAgoDates(monthsAgo);
        var gr = new GlideRecord('sn_bm_client_score');
        gr.addQuery('indicator.active', true);

        if (!gs.nil(category))
            gr.addQuery('indicator.category', category);
        if (!gs.nil(kpi))
            gr.addQuery('indicator', kpi);

        gr.orderByDesc('start_date');
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            var date = new GlideDateTime(gr.start_date).getDate();
            date.addMonthsUTC(1 - monthsAgo);
            dateRange.start = date;
        }
        return dateRange;
    },

    getClientConfig: function() {
        var bdTypes = ['sn_bm_common_industry', 'sn_bm_common_size_bucket', 'sn_bm_client_region', 'sn_bm_client_msp'];
        var breakdowns = {};

        for (var i in bdTypes) {
            breakdowns[bdTypes[i]] = '';
        }
        var gr = new GlideRecord('sn_bm_client_configuration');
        gr.addQuery('name', 'IN', bdTypes);
        gr.query();
        while (gr.next()) {
            breakdowns[gr.name] = gr.getValue('value');
        }
        return breakdowns;
    },

    getDisplayValue: function(mean) {
        var days = Math.floor(mean / 24).toString();
        var hours = (mean % 24).toString();
        var value = days === '0' ? hours : mean.toString();
        if (gs.getProperty('sn_bm_client.dashboard_display_unit') === 'hours' || days === '0') {
            return value === '1' ? gs.getMessage('1 hour') : gs.getMessage('{0} hours', value);
        } else if (hours === '0') {
            return days === '1' ? gs.getMessage('1 day') : gs.getMessage('{0} days', days);
        }
        return gs.getMessage('{0}d {1}h', [days, hours]);
    },

    getUnitFormattedValue: function(value) {
        if (gs.getProperty('sn_bm_client.dashboard_display_unit') === 'hours')
            return value;
        return value / 24;
    },

    type: 'BenchmarkScoreUtil'
};
