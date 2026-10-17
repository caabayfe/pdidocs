var MultiSourceQueryProcessor = Class.create();
MultiSourceQueryProcessor.prototype = {
    MULTISOURCE_DATA: 'cmdb_multisource_data',
    CMDB_CLASS_INFO: 'cmdb_class_info',
    CI_FILTER: 'sn_cmdb_ws_ms_ci_filter',
    CHART_CLASS_CI_COUNT: 'sn_cmdb_ws_ms_chart_class_ci_count',
    CLASS_CI_COUNT: 'sn_cmdb_ws_ms_class_ci_count',
    CIS_BY_NUMBER_OF_SOURCES: 'sn_cmdb_ws_ms_cis_by_number_of_sources',
    CIS_WITH_SINGLE_SOURCE: 'sn_cmdb_ws_ms_cis_with_single_source',
    MULTISOURCE_CLASS_METADATA: 'sn_cmdb_ws_ms_class_metadata',
    MULTISOURCE_DASHBOARD_DATA: 'sn_cmdb_ws_ms_ci_dashboard_data',
    DISCOVERY_SOURCES_NOT_REPORTING: 'sn_cmdb_ws_ms_discovery_sources_not_reporting',
    MULTISOURCE_COLUMN_METADATA: 'cmdb_multisource_column_metadata',
    CMDB_MULTISOURCE_DIFF_QUERY_VIEW: 'cmdb_multisource_diff_query_view',
    CMDB_MULTISOURCE_DENY_CLASS: 'cmdb_multisource_deny_class',
    CMDB_MULTISOURCE_REPORT_SKIPPED_CLASS: 'sn_cmdb_ws_ms_skip_class',
    CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1: 'msd1_',
    CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_2: 'msd2_',
    DATA_MISMATCH_CONFIG: 'sn_cmdb_ws_ms_data_mismatch_config',
    DATA_MISMATCH: 'sn_cmdb_ws_ms_data_mismatch',
    SETTINGS_WEIGHT_TYPE: 'sn_cmdb_ws_ms_settings_weight_type',
    MULTISOURCE_REPORT_MAX_LIMIT_PROPERTY: 'sn_cmdb_ws.ms.report_max_limit',
    MULTISOURCE_REPORT_CLASS_CI_COUNT_MAX_THRESHOLD_PROPERTY: 'sn_cmdb_ws.ms.report_class_ci_count_max_threshold',
    DISCOVERY_SOURCE_NOT_REPORTING_MAX_DAYS_PROPERTY: 'sn_cmdb_ws.ms.discovery_source_not_reporting_max_days',
    MULTISOURCE_CALCULATE_CMDB_ONLY_PROPERTY: 'sn_cmdb_ws.ms.calculate_cmdb_only',
    MULTISOURCE_NON_CMDB_CI_ENABLED_PROPERTY: 'glide.identification_engine.multisource_non_cmdb_ci_enabled',
    GLIDE_AGGREGATES_MAX_LIMIT_PROPERTY: 'glide.db.max.aggregates',
    CMDB_CI: 'cmdb_ci',
    HARDWARE: 'cmdb_ci_hardware',
    READ_REPLICA_CATEGORY: 'cmdb_health_score',
    NAME: 'name',

    // Columns in cmdb_multisource_data
    DISCOVERY_SOURCE: 'discovery_source',
    CLASS_NAME: 'class',
    CI: 'ci',
    SYS_ID: 'sys_id',
    CMDB_REFERENCE: 'cmdb_reference',
    MAX_COUNT: 'max_count',
    CURRENT_COUNT: 'current_count',
    READ_COUNT: 'read_count',
    WRITE_COUNT: 'write_count',

    // Columns in cmdb_class_info
    PRINCIPAL_CLASS: 'principal_class',

    // Columns in sn_cmdb_ws_ms_class_metadata
    TABLE: 'table',
    CI_COUNT_PERCENT: 'ci_count_percent',
    FILTER: 'filter',

    // Columns in sn_cmdb_ws_ms_data_mismatch_config
    ATTRIBUTES: 'attributes',
    CONDITION_TYPE: 'condition_type',
    DISCOVERY_SOURCES: 'discovery_sources',

    // Columns in sn_cmdb_ws_ms_data_mismatch
    SOURCE_1: 'source_1',
    SOURCE_1_VALUE: 'source_1_value',
    CLASS_1: 'class_1',

    SOURCE_2: 'source_2',
    SOURCE_2_VALUE: 'source_2_value',
    CLASS_2: 'class_2',

    DIFF_FIELD: 'diff_field',

    // Columns in sn_cmdb_ws_ms_ci_by_number_source
    SOURCE_COUNT: 'source_count',
    CI_COUNT: 'ci_count',
    STATE: 'state',
    DRAFT: 1,
    READY: 2,
    RETIRED: 3,

    //Columns in sn_cmdb_ws_ms_ci_coverage
    SOURCE: 'source',

    // Columns in table sn_cmdb_ws_ms_ci_dashboard_data
    CHART: 'chart',
    KEY: 'key',
    VALUE: 'value',

    // Charts in table sn_cmdb_ws_ms_ci_dashboard_data
    NUMBER_OF_DISCOVERY_SOURCES: 'number_of_discovery_sources',
    RAW_RECORDS: 'raw_records',
    RECONCILED_CIS: 'reconciled_cis',
    CHART_DATA_MISMATCH: 'data_mismatch',
    CHART_CIS_WITH_SINGLE_SOURCE: 'cis_with_single_source',
    CHART_CIS_BY_NUMBER_OF_SOURCES: 'cis_by_number_of_sources',
    SOURCE_OVERVIEW: 'source_overview',
    CHART_DISCOVERY_SOURCE_NOT_REPORTING: 'discovery_source_not_reporting',

    // Use this constant in dashboard data when there are no CIs discovered by single source
    ZERO_CIS_WITH_A_SINGLE_SOURCE_KEY: 'zero_cis_with_a_single_source',
    ZERO_CIS_WITH_A_SINGLE_SOURCE_VALUE: 0,

    // Columns in sn_cmdb_ws_ms_discovery_sources_not_reporting
    LAST_DISCOVERED: 'last_discovered',

    // Columns in cmdb_multisource_column_metadata
    FIELD: 'field',
    MS_TABLE_FIELD: 'ms_table_field',

    // Query constants
    NSAMEAS: 'NSAMEAS',
    LT_FIELD: 'LT_FIELD',
    IN: 'IN',

    // Filters (CMDB_CI and PRINCIPAL_CLASS are already defined)
    ALL_FILTER: 'All',
    CMDB_CI_FILTER: 'CMDB CI',
    PRINCIPAL_CLASS_FILTER: 'Principal Class',

    // Columns in sn_cmdb_ws_ms_skip_class
    IS_SYSTEM_UPDATED: 'is_system_updated',
    IS_USER_UPDATED: 'is_user_updated',

    // Columns in sn_cmdb_ws_ms_settings_weight_type
    SETTINGS: 'settings',
    WEIGHT_TYPE: 'weight_type',
    COVERAGE_SETTINGS: 'coverage_settings',
    AUTOMATIC: 'automatic',

    // Columns in sn_cmdb_ws_ms_ci_filter
    ENCODED_QUERY: 'encoded_query',

    initialize: function () {
        this.MULTISOURCE_CALCULATE_CMDB_ONLY = gs.getProperty(this.MULTISOURCE_CALCULATE_CMDB_ONLY_PROPERTY, 'false') == 'true';
        this.MULTISOURCE_NON_CMDB_CI_ENABLED = gs.getProperty(this.MULTISOURCE_NON_CMDB_CI_ENABLED_PROPERTY, 'true') == 'true';
        this.multiSourceDenyList = this._getMultisourceDenyList();
        this.classConfig = this._getMultisourceClassConfig();
        this.columnMetadataMapping = this._populateColumnMapping();
        this.filterMappings = this._getFilterMappings();
        this.principalClasses = this._getPrincipalClasses();
        this.skippedClasses = this._getSkippedClasses();
        this.MULTISOURCE_REPORT_MAX_LIMIT = gs.getProperty(this.MULTISOURCE_REPORT_MAX_LIMIT_PROPERTY, 100000);
        //TODO: This will be updated once we have the audit results for the multisource max class CI counts
        this.MULTISOURCE_REPORT_CLASS_CI_COUNT_MAX_THRESHOLD = parseInt(gs.getProperty(this.MULTISOURCE_REPORT_CLASS_CI_COUNT_MAX_THRESHOLD_PROPERTY, 10000000));
        this.DISCOVERY_SOURCE_NOT_REPORTING_MAX_DAYS = gs.getProperty(this.DISCOVERY_SOURCE_NOT_REPORTING_MAX_DAYS_PROPERTY, 7);
        // Default value of max aggregates is from GlideAggregate.java
        this.MAX_SUPPORTED_GLIDE_AGGREGATES = parseInt(gs.getProperty(this.GLIDE_AGGREGATES_MAX_LIMIT_PROPERTY, 100000));
    },

    populateCIsBySource: function() {
        // Cleanup the existing aggregated entries
        // If there any records in the aggregate table in "Draft" state, mark them as "Retired"
        this._updateState(this.DRAFT, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.SOURCE_OVERVIEW);

        // Calculate the aggregate stats and populate in dashboard data with key as "Source_Overview" for each filter
        for (var filter in this.filterMappings) {
            var agg = this._populateCIsBySource(this.filterMappings[filter].query);
            while (agg.next()) {
                var ciCount = agg.getAggregate('COUNT', this.CMDB_CI);
                var discoverySource = agg.getValue(this.DISCOVERY_SOURCE);

                // Insert a record in draft state
                this._populateMultisourceDashboardData(this.SOURCE_OVERVIEW, discoverySource, ciCount, this.DRAFT, filter);
            }
        }

        // Update the existing records in "Ready" state to "Retired"
        this._updateState(this.READY, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.SOURCE_OVERVIEW);
        // Update the existing records in "Draft" state to "Ready"
        this._updateState(this.DRAFT, this.READY, this.MULTISOURCE_DASHBOARD_DATA, this.SOURCE_OVERVIEW);
    },

    /**
     * Populate coverage charts i.e. CIs by number of sources and CIs with single source
     */
    populateCoverageCharts: function(active) {
        var classCICounts = this._getClassCICounts();

        // Cleanup the existing class ci counts
        this._updateState(this.DRAFT, this.RETIRED, this.CLASS_CI_COUNT);

        // Populate the class CI counts in the database table
        this._populateClassCICounts(classCICounts, this.DRAFT);

        if (!active) {
            gs.debug("User skipped calculating coverage charts data. Only calculating class CI counts");

           // Move the existing records from Ready to Retired state for overall class ci counts
           this._updateState(this.READY, this.RETIRED, this.CLASS_CI_COUNT);

           // Move the current records from Draft to Ready state for overall class ci counts
           this._updateState(this.DRAFT, this.READY, this.CLASS_CI_COUNT);

            return;
        }

        // Compute the class config for each class
        var coverageChartClassConfig = this._getCoverageChartClassConfigs(classCICounts);

        var filteredClassCICounts = this._filterClassCICounts(classCICounts, coverageChartClassConfig);

        this._cleanupSkippedClasses(filteredClassCICounts);

        // Cleanup the existing agggregate, data drill down and class counts data for number source coverage charts
        this._updateState(this.DRAFT, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_CIS_BY_NUMBER_OF_SOURCES);
        this._updateState(this.DRAFT, this.RETIRED, this.CIS_BY_NUMBER_OF_SOURCES);
        this._updateState(this.DRAFT, this.RETIRED, this.CHART_CLASS_CI_COUNT, this.CHART_CIS_BY_NUMBER_OF_SOURCES);

        // Cleanup the existing agggregate, data drill down and class counts data for single source coverage charts
        this._updateState(this.DRAFT, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_CIS_WITH_SINGLE_SOURCE);
        this._updateState(this.DRAFT, this.RETIRED, this.CIS_WITH_SINGLE_SOURCE);
        this._updateState(this.DRAFT, this.RETIRED, this.CHART_CLASS_CI_COUNT, this.CHART_CIS_WITH_SINGLE_SOURCE);

        // Max discovery source number counts i.e. 1, 2, 3, 4 and 5+
        var maxSources = 5;
        var totalNumberSourcePopulatedCICount = 0;
        var totalSingleSourcePopulatedCICount = 0;

        /**
         * 1. Iterate over each class in the multisource table
         * 2. For each class, compute the CIs reported by number of sources i.e. 1, 2, 3, 4, 5
         * 3. Compute the max limit per class per number source
         * 4. Populate raw data records if count is within max limit
         * 5. Store the ci count per class per number source in the class count table
         */
        for (var i = 0; i < filteredClassCICounts.length; i++) {
            var className = filteredClassCICounts[i].class_name;
            var numberSourceMaxLimit = this._getNumberSourceMaxLimit(className, coverageChartClassConfig, totalNumberSourcePopulatedCICount, maxSources);

            var singleSourceMaxLimit = this._getSingleSourceMaxLimit(className, coverageChartClassConfig, totalSingleSourcePopulatedCICount);

            var numberSourcePopulatedCICount = 0;
            var singleSourcePopulatedCICount = 0;

            for (var j = 1; j <= maxSources; j++) {
                var ciCount = 0;
                var sourceCount = (j == maxSources) ? j + "+" : j + "";
                var sourceCICounts = {};

                var start = 0, end = this.MAX_SUPPORTED_GLIDE_AGGREGATES - 1;
                do {
                    var singleBatchRowCount = 0;
                    var ga = this._getAggregateCoverageCharts(j, maxSources, start, end, className);
                    while (ga.next()) {
                        if (ciCount < numberSourceMaxLimit) {
                            this._populateNumberSourceCoverageData(ga, j, maxSources);
                            numberSourcePopulatedCICount++;
                        }
                        // Compute class CI counts for single source coverage chart
                        if (j == 1) {
                            if (ciCount < singleSourceMaxLimit) {
                                this._populateSingleSourceCoverageData(ga);
                                singleSourcePopulatedCICount++;
                            }
                            this._updateSourceCICount(sourceCICounts, ga.getAggregate('MAX', this.DISCOVERY_SOURCE));
                        }
                        singleBatchRowCount++;
                        ciCount++;
                    }
                    start = end + 1;
                    end = end + this.MAX_SUPPORTED_GLIDE_AGGREGATES;
                } while (singleBatchRowCount == this.MAX_SUPPORTED_GLIDE_AGGREGATES);

                // Populate Class CI counts for number source coverage chart
                this._populateChartClassCICount(this.CHART_CIS_BY_NUMBER_OF_SOURCES, className, sourceCount, ciCount, this.DRAFT);

                // Populate Class CI counts for single source coverage chart
                if (j == 1 && Object.keys(sourceCICounts).length > 0) {
                    for (source in sourceCICounts) {
                        this._populateChartClassCICount(this.CHART_CIS_WITH_SINGLE_SOURCE, className, source, sourceCICounts[source], this.DRAFT);
                    }
                }
            }
            this._updateCoverageChartCurrentCICounts(coverageChartClassConfig, className, numberSourcePopulatedCICount, singleSourcePopulatedCICount);

            totalNumberSourcePopulatedCICount += numberSourcePopulatedCICount;
            totalSingleSourcePopulatedCICount += singleSourcePopulatedCICount;
        }
        gs.debug("Completed computing aggregate counts and raw data population for coverage charts");

        // Populate aggregate data for number source coverage charts
        this._populateNumberSourceAggregateData();
        gs.debug("Completed populating aggregate counts for CIs by number of sources chart");

        // Populate aggregate data for single source coverage charts
        this._populateSingleSourceAggregateData();
        gs.debug("Completed populating aggregate counts for CIs with single source chart");

        // Move the existing records from Ready to Retired state for number source coverage charts
        this._updateState(this.READY, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_CIS_BY_NUMBER_OF_SOURCES);
        this._updateState(this.READY, this.RETIRED, this.CIS_BY_NUMBER_OF_SOURCES);
        this._updateState(this.READY, this.RETIRED, this.CHART_CLASS_CI_COUNT, this.CHART_CIS_BY_NUMBER_OF_SOURCES);

        // Move the current records from Draft to Ready state for number source coverage charts
        this._updateState(this.DRAFT, this.READY, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_CIS_BY_NUMBER_OF_SOURCES);
        this._updateState(this.DRAFT, this.READY, this.CIS_BY_NUMBER_OF_SOURCES);
        this._updateState(this.DRAFT, this.READY, this.CHART_CLASS_CI_COUNT, this.CHART_CIS_BY_NUMBER_OF_SOURCES);

        // Move the existing records from Ready to Retired state for single source coverage charts
        this._updateState(this.READY, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_CIS_WITH_SINGLE_SOURCE);
        this._updateState(this.READY, this.RETIRED, this.CIS_WITH_SINGLE_SOURCE);
        this._updateState(this.READY, this.RETIRED, this.CHART_CLASS_CI_COUNT, this.CHART_CIS_WITH_SINGLE_SOURCE);

        // Move the current records from Draft to Ready state for single source coverage charts
        this._updateState(this.DRAFT, this.READY, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_CIS_WITH_SINGLE_SOURCE);
        this._updateState(this.DRAFT, this.READY, this.CIS_WITH_SINGLE_SOURCE);
        this._updateState(this.DRAFT, this.READY, this.CHART_CLASS_CI_COUNT, this.CHART_CIS_WITH_SINGLE_SOURCE);

        // Move the existing records from Ready to Retired state for class ci counts
        this._updateState(this.READY, this.RETIRED, this.CLASS_CI_COUNT);

        // Move the current records from Draft to Ready state for class ci counts
        this._updateState(this.DRAFT, this.READY, this.CLASS_CI_COUNT);
    },

    //Populates the Number of discovery sources in the sn_cmdb_ws_ms_ci_dashboard_data table
    populateNumberOfDiscoverySources: function() {
      // Update the existing records in "Draft" state to "Retired"
      this._updateState(this.DRAFT, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.NUMBER_OF_DISCOVERY_SOURCES);
      // Insert a record in draft state for each filter
      for (var filter in this.filterMappings) {
        var count = this._getNumberOfDiscoverySources(this.filterMappings[filter].query);
        this._populateMultisourceDashboardData(this.NUMBER_OF_DISCOVERY_SOURCES, this.NUMBER_OF_DISCOVERY_SOURCES, count, this.DRAFT, filter);
      }
      // Update the existing records in "Ready" state to "Retired"
      this._updateState(this.READY, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.NUMBER_OF_DISCOVERY_SOURCES);
      // Update the existing records in "Draft" state to "Ready"
      this._updateState(this.DRAFT, this.READY, this.MULTISOURCE_DASHBOARD_DATA, this.NUMBER_OF_DISCOVERY_SOURCES);
    },

    //Populates the Raw records in the sn_cmdb_ws_ms_ci_dashboard_data table
    populateRawRecords: function() {
      // Update the existing records in "Draft" state to "Retired"
      this._updateState(this.DRAFT, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.RAW_RECORDS);
      // Insert a record in draft state for each filter
      for (var filter in this.filterMappings) {
        var count = this._getRawRecords(this.filterMappings[filter].query);
        this._populateMultisourceDashboardData(this.RAW_RECORDS, this.RAW_RECORDS, count, this.DRAFT, filter);
      }
      // Update the existing records in "Ready" state to "Retired"
      this._updateState(this.READY, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.RAW_RECORDS);
      // Update the existing records in "Draft" state to "Ready"
      this._updateState(this.DRAFT, this.READY, this.MULTISOURCE_DASHBOARD_DATA, this.RAW_RECORDS);
    },

    //Populates the Reconciled CIs in the sn_cmdb_ws_ms_ci_dashboard_data table
    populateReconciledCIs: function() {
      // Update the existing records in "Draft" state to "Retired"
      this._updateState(this.DRAFT, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.RECONCILED_CIS);
      // Insert a record in draft state for each filter
      for (var filter in this.filterMappings) {
        var count = this._getReconciledCIs(this.filterMappings[filter].query);
        this._populateMultisourceDashboardData(this.RECONCILED_CIS, this.RECONCILED_CIS, count, this.DRAFT, filter);
      }
      // Update the existing records in "Ready" state to "Retired"
      this._updateState(this.READY, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.RECONCILED_CIS);
      // Update the existing records in "Draft" state to "Ready"
      this._updateState(this.DRAFT, this.READY, this.MULTISOURCE_DASHBOARD_DATA, this.RECONCILED_CIS);
    },

    populateDiscoverySourcesNotReportingCIs: function() {
        // If there any records in the data drill down and aggregate tables in "Draft" state, mark them as "Retired"
        // We need this because the new records we will create further will be in "Draft" state by default and we move them to "Ready" state.
        this._updateState(this.DRAFT, this.RETIRED, this.DISCOVERY_SOURCES_NOT_REPORTING);
        this._updateState(this.DRAFT, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_DISCOVERY_SOURCE_NOT_REPORTING);

        // Populate the aggregate count for discovery sources not reporting
        var aggCount = this._evaluateCIsNotReportedByDiscoverySources(0, true);
        this._populateMultisourceDashboardData(this.CHART_DISCOVERY_SOURCE_NOT_REPORTING, this.CHART_DISCOVERY_SOURCE_NOT_REPORTING, aggCount, this.DRAFT);

        /**
         * Check the below conditions before inserting into 'sn_cmdb_ws_ms_discovery_sources_not_reporting' table
         * 1. If the class config is not defined or aggregate count is less than max limit, populate upto the max limit defined in 'sn_cmdb_ws.ms.report_max_limit'
         * 2. Otherwise, iterate over the class config and follow the below steps:
         *    a. Calculate the max limit using the class config percent value
         *    b. Populate till max limit is reached and repeat the same for all classes in the config
         */
        if (aggCount < this.MULTISOURCE_REPORT_MAX_LIMIT || Object.keys(this.classConfig).length == 0) {
            gs.debug(this.MULTISOURCE_CLASS_METADATA + " is empty or total records is less than max limit. Getting max of " + this.MULTISOURCE_REPORT_MAX_LIMIT
            + " records for CIs not reported by dicovery source in the past " + this.DISCOVERY_SOURCE_NOT_REPORTING_MAX_DAYS + " days.");
            this._evaluateCIsNotReportedByDiscoverySources(this.MULTISOURCE_REPORT_MAX_LIMIT, false);
        } else {
            gs.debug(this.MULTISOURCE_CLASS_METADATA + " is empty. Getting max of " + this.MULTISOURCE_REPORT_MAX_LIMIT
            + " records for CIs not reported by dicovery source in the past " + this.DISCOVERY_SOURCE_NOT_REPORTING_MAX_DAYS + " days.");
            for (var key in this.classConfig) {
                var config = this.classConfig[key];
                // Do not run discovery source not reporting for non-cmdb classes as they do not have the last_discovered column mapping
                if (this._extendsFromTable(config.table, this.CMDB_CI)) {
                    var classConfigMaxLimit = Math.round(this.MULTISOURCE_REPORT_MAX_LIMIT * (config.ci_count_percent / 100));
                    this._evaluateCIsNotReportedByDiscoverySources(classConfigMaxLimit, false, config.table);
                }
            }
        }

        // Mark the existing raw data in "Ready" state stored for data drill down and aggregate tables as "Retired"
        this._updateState(this.READY, this.RETIRED, this.DISCOVERY_SOURCES_NOT_REPORTING);
        this._updateState(this.READY, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_DISCOVERY_SOURCE_NOT_REPORTING);

        // Mark the current raw data in "Draft" state stored for data drill down and agregate tables as "Ready"
        this._updateState(this.DRAFT, this.READY, this.DISCOVERY_SOURCES_NOT_REPORTING);
        this._updateState(this.DRAFT, this.READY, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_DISCOVERY_SOURCE_NOT_REPORTING);
    },

    /**
     * Populates the aggregate count of data mismatch records in sn_cmdb_ws_ms_ci_dashboard_data table with key as data_mismatch
     * Populates the raw data mismatch records based on data mismatch settings in sn_cmdb_ws_ms_data_mismatch
     */
    populateDataMismatch: function () {
        // If there any records in the data drill down table in "Draft" state, mark them as "Retired"
        // We need this because the new records we will create further will be in "Draft" state by default and we move them to "Ready" state.
        this._updateState(this.DRAFT, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_DATA_MISMATCH);
        this._updateState(this.DRAFT, this.RETIRED, this.DATA_MISMATCH);

        // Calculate aggregate data mismatch count and insert with draft state
        var count = this._calculateDataMismatchAggregateCount();
        this._populateMultisourceDashboardData(this.CHART_DATA_MISMATCH, this.CHART_DATA_MISMATCH, count, this.DRAFT);

        // Populates raw data mismatch records in sn_cmdb_ws_ms_data_mismatch table by leveraging sn_cmdb_ws_ms_data_mismatch_config
        this._populateDataMismatchRawData(count);

        // Update the existing records in "Ready" state to "Retired" for both aggregated and raw data tables
        this._updateState(this.READY, this.RETIRED, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_DATA_MISMATCH);
        this._updateState(this.READY, this.RETIRED, this.DATA_MISMATCH);

        // Update the existing records in "Draft" state to "Ready" for both aggregated and raw data tables
        this._updateState(this.DRAFT, this.READY, this.MULTISOURCE_DASHBOARD_DATA, this.CHART_DATA_MISMATCH);
        this._updateState(this.DRAFT, this.READY, this.DATA_MISMATCH);

    },

    /**
     * Insert a record into the sn_cmdb_ws_ms_ci_coverage_data table
     */
    _populateSingleSourceCoverageData: function(ga) {
        var gr = new GlideRecord(this.CIS_WITH_SINGLE_SOURCE);
        gr.initialize();
        gr.setValue(this.SOURCE, ga.getAggregate('MAX', this.DISCOVERY_SOURCE));
        gr.setValue(this.CLASS_NAME, ga.getValue(this.CLASS_NAME));
        gr.setValue(this.CI, ga.getValue(this.CI));
        /**
         * Group by CI (Document Id) is currently not working in Multisource dashboard,
         * we need to remove this once that defect is fixed
         * Populating non-cmdb Sys Id into the cmdb_reference field for grouping purpose
         * And also to optimize the check for hierarchy at every row
         * UI will have cmdb_reference column instead of Document Id until the defect is fixed
         */
        gr.setValue(this.CMDB_REFERENCE, ga.getValue(this.CI));
        gr.insert();
    },

    /**
     * Gets the aggregate object for multisource records grouped by CI for each discovery source count
     * Add window for the query results (start, end), it will return a maximum rows of (end -start)
     * If glide aggregate returns rows equal to the size(end -start), it indicates more potential data
     * If sourceCount is 1, add discovery source to the aggregate (for single source chart)
     */
    _getAggregateCoverageCharts: function(sourceCount, maxSourceCount, start, end, className) {
        var agg = new GlideAggregate(this.MULTISOURCE_DATA);
        agg.addQuery(this.CLASS_NAME, className);
        agg.groupBy(this.CI);

        // For single source coverage chart, add discovery source to the aggregate
        if (sourceCount == '1') {
            agg.addAggregate('MAX', this.DISCOVERY_SOURCE);
        }

        /**
         * maxSourceCount is the maximum number of discovery sources we have for this report i.e. 5
         * sourceCount is the current number of discovery sources we want to query i.e. one of 1, 2, 3, 4 or 5+
         *
         * For CIs with sourceCount 1, 2, 3 and 4, check for exact match e.g. HAVING COUNT(discovery_source) = 2
         * For CIs with sourceCount 5+, check for count greater than 4 e.g. HAVING COUNT(discovery_source) > 4
         */
        agg.addHaving('COUNT', this.DISCOVERY_SOURCE, sourceCount == maxSourceCount ? '>' : '=', sourceCount == maxSourceCount ? (maxSourceCount - 1) : sourceCount);
        agg.chooseWindow(start, end);
        agg.setCategory(this.READ_REPLICA_CATEGORY);
        agg.query();
        return agg;
    },

    /**
     * Populate the sn_cmdb_ws_ms_ci_by_number_source_data table for passed source count i.e. 1, 2, 3, 4, and 5+
     */
    _populateNumberSourceCoverageData: function(ga, sourceCount, maxSources) {
        var gr = new GlideRecord(this.CIS_BY_NUMBER_OF_SOURCES);
        gr.initialize();
        gr.setValue(this.SOURCE_COUNT, sourceCount == maxSources ? sourceCount + "+" : sourceCount + "");
        gr.setValue(this.CLASS_NAME, ga.getValue(this.CLASS_NAME));
        gr.setValue(this.CI, ga.getValue(this.CI));
        /**
         * Group by CI (Document Id) is currently not working in Multisource dashboard,
         * we need to remove this once that defect is fixed
         * Populating non-cmdb Sys Id into the cmdb_reference field for grouping purpose
         * And also to optimize the check for hierarchy at every row
         * UI will have cmdb_reference column instead of Document Id until the defect is fixed
         */
        gr.setValue(this.CMDB_REFERENCE, ga.getValue(this.CI));
        gr.insert();
    },

    /**
     * Creates an object to store the class metadata for multisource reports
     * Each object contains the table name as key and its ci_count_percent (percentage of CIs to be included) as value
     * Reset the ci_count_percent for applicable classes
     */
    _getMultisourceClassConfig: function() {
        var configs = {};
        var inValidClasses = [];
        var validClasses = [];
        var gr = new GlideRecord(this.MULTISOURCE_CLASS_METADATA);
        gr.query();

        while (gr.next()) {
            var table = gr.getValue(this.TABLE);
            var ciCountPercent = gr.getValue(this.CI_COUNT_PERCENT);
            // Check if cmdb only population is enabled and class is not amongst deny list classes
            if ((this._skipNonCMDBDataPopulation(table) || this.multiSourceDenyList[table]) && ciCountPercent != 0) {
                inValidClasses.push(table);
            } else {
                validClasses.push(table);
                var config = {
                    table: table,
                    ci_count_percent: ciCountPercent,
                    current_ci_count: {
                        number_source_count: 0,
                        single_source_count: 0
                    }
                };
                configs[table] = config;
            }
        }

        // If the weight type is AUTOMATIC, check if resetting is needed
        var coverageChartWeightType = this._getSettingsWeightType(this.COVERAGE_SETTINGS);
        if (coverageChartWeightType === this.AUTOMATIC) {
            var ciCountPercent = Math.round(100 / validClasses.length);
            var needsReset = false;

            // Check if any valid class's ci_count_percent is different from the target
            for (var i = 0; i < validClasses.length; i++) {
                var table = validClasses[i];
                if (configs[table].ci_count_percent != ciCountPercent) {
                    needsReset = true;
                    break;
                }
            }

            // If reset is needed, perform reset for both valid and invalid classes
            if (needsReset) {
                /**
                 * There is a BR that ensures the ci_count_percent total for all classes does not exceed 100
                 * Consider a scenario where serial_number was in deny list and as a result config is hardware -> 50, endpoint -> 50, serial_number -> 0
                 * Now, serial_number is no longer denied so we want to update the config to hardware -> 33, endpoint -> 33, serial_number -> 33
                 * If GlideRecord tries to update the serial_number first to 33, the BR will throw an error
                 * An alternative way is to reset all the classes to 0 and re-populate valid classes again with correct ci_percent_count
                 */
                this._resetMultisourceClassConfig(validClasses.concat(inValidClasses), 0);
                this._resetMultisourceClassConfig(validClasses, ciCountPercent);

                // Update the ci_count_percent for valid classes
                for (var k = 0; k < validClasses.length; k++) {
                    var validTable = validClasses[k];
                    configs[validTable].ci_count_percent = ciCountPercent;
                }
            }
        } else {
            // If the weight type is not AUTOMATIC, reset the invalid classes
            this._resetMultisourceClassConfig(inValidClasses, 0);
        }

        return configs;
    },

    // Update the ci_count_percent for the list of classes
    _resetMultisourceClassConfig: function(classNames, ci_count_percent) {
        var batchSize = 100;

        for (var j = 0; j < classNames.length; j += batchSize) {
            var chunk = classNames.slice(j, j + batchSize);
            var gr = new GlideRecord(this.MULTISOURCE_CLASS_METADATA);
            gr.addQuery(this.TABLE, this.IN, chunk);
            gr.setValue(this.CI_COUNT_PERCENT, ci_count_percent);
            gr.updateMultiple();
        }
    },

    _getSettingsWeightType: function(settingsChart) {
        var gr = new GlideRecord(this.SETTINGS_WEIGHT_TYPE);
        gr.addQuery(this.SETTINGS, settingsChart);
        gr.setLimit(1);
        gr.query();

        if (gr.next()) {
            return gr.getValue(this.WEIGHT_TYPE);
        }

        return this.AUTOMATIC;
    },

    _updateState: function(sourceState, targetState, table, chart) {
        var gr = new GlideRecord(table);
        if(chart)
          gr.addQuery(this.CHART, chart);
        gr.addQuery(this.STATE, sourceState);
        gr.setValue(this.STATE, targetState);
        gr.updateMultiple();
    },

    //Returns the number of CIs per discovery source
    _populateCIsBySource: function(query) {
        var agg = new GlideAggregate(this.MULTISOURCE_DATA);
        agg.addAggregate('COUNT', this.CMDB_CI);
        if (query) {
            agg.addQuery(query);
        }
        agg.groupBy(this.DISCOVERY_SOURCE);
        agg.setCategory(this.READ_REPLICA_CATEGORY);
        agg.query();

        return agg;
    },

    //Returns the number of Raw records
    _getRawRecords: function(query) {
      var agg = new GlideAggregate(this.MULTISOURCE_DATA);
      agg.addAggregate('COUNT');
      if (query) {
        agg.addEncodedQuery(query);
      }
      agg.setCategory(this.READ_REPLICA_CATEGORY);
      agg.query();
      var records = 0;
      if (agg.next())
        records = agg.getAggregate('COUNT');
      return records;
    },

    //Returns the number of Reconciled CIs
    _getReconciledCIs: function(query) {
      var agg = new GlideAggregate(this.MULTISOURCE_DATA);
      agg.addAggregate('COUNT(DISTINCT', this.CI);
      if (query) {
        agg.addEncodedQuery(query);
      }
      agg.setGroup(false);
      agg.setCategory(this.READ_REPLICA_CATEGORY);
      agg.query();
      var records = 0;
      if (agg.next())
        records = agg.getAggregate('COUNT(DISTINCT', this.CI);
      return records;
    },

    //Returns the number of Discovery sources
    _getNumberOfDiscoverySources: function(query) {
      var agg = new GlideAggregate(this.MULTISOURCE_DATA);
      agg.addAggregate('COUNT(DISTINCT', this.DISCOVERY_SOURCE);
      if (query) {
        agg.addEncodedQuery(query);
      }
      agg.setGroup(false);
      agg.setCategory(this.READ_REPLICA_CATEGORY);
      agg.query();
      var records = 0;
      if (agg.next())
        records = agg.getAggregate('COUNT(DISTINCT', this.DISCOVERY_SOURCE);
      return records;
    },

    /**
     * Populate the sn_cmdb_ws_ms_ci_dashboard_data table
     * chart: Chart on the Multisource Dashboard
     * key: Key in the chart
     * value: Value in the chart
     * state: State in the record i.e. Draft, Ready, Retired
     * Example
     * chart: Number of discovery sources
     * key: number_of_discovery_sources
     * value: 15
     * state: Draft
     */

    _populateMultisourceDashboardData: function(chart, key, value, state, filter) {
      var gr = new GlideRecord(this.MULTISOURCE_DASHBOARD_DATA);
      gr.initialize();
      gr.setValue(this.CHART, chart);
      gr.setValue(this.KEY, key);
      gr.setValue(this.VALUE, value);
      gr.setValue(this.STATE, state);
      if (filter) {
        var filterSysId = this.filterMappings[filter].sys_id;
        gr.setValue(this.FILTER, filterSysId);
      }
      gr.insert();
    },

    /**
     * Evaluate if a discovery source is not reporting a CI for 'n' number of days
     *
     * @param limit The total number of records to compute the discovery sources not reporting (0 for aggreagte count)
     * @param isCountOnly Flag to indicate this method is called for data count or populating actual data
     * @param className Class name to compute the discovery sources not reporting
     */
     _evaluateCIsNotReportedByDiscoverySources: function(limit, isCountOnly, className) {
        var count = 0;
        var ci, lastDiscovered, maxLastDiscovered;

        // Get the multisource column mapping for 'last_discovered' in 'cmdb_multisource_column_metadata'
        var lastDiscoveredColumnMapping = this._getIndexedColumn(this.CMDB_CI, this.LAST_DISCOVERED);

        /**
         * Query the 'cmdb_multisource_data' and sort by ci and last_discovered (in descending order).
         * Compare last_discovered for all other rows for of that CI with the max last_discovered.
         * Populate the 'sn_cmdb_ws_ms_discovery_sources_not_reporting' table where the source is not reporting.
         */
        var gr = this._getCIsNotReportedByDiscoverySources(className != null ? className : this.CMDB_CI, lastDiscoveredColumnMapping);
        while (gr.next()) {
            // Break if we do not want the count of all records and have reached the limit
            if (count >= limit && !isCountOnly)
                break;
            // Check if the current CI is same as the previos CI.
            // If not, it means we have to calculate for a different CI. Reset the ci and maxLastDiscovered values
            if (ci != gr.getValue(this.CI)) {
                ci = gr.getValue(this.CI);
                maxLastDiscovered = gr.getValue(lastDiscoveredColumnMapping);
                continue;
            }
            // If the lastDiscovered is older than maxLastDiscovered, populate the 'sn_cmdb_ws_ms_discovery_sources_not_reporting' table
            lastDiscovered = gr.getValue(lastDiscoveredColumnMapping);
            if (this._isLastDiscoveredOlderThanMaxDays(lastDiscovered, maxLastDiscovered)) {
                // Populate the 'sn_cmdb_ws_ms_discovery_sources_not_reporting' only when isCountOnly flag is false
                if (count < limit && !isCountOnly)
                    this._populateDiscoverySourceNotReportingData(ci, gr.getValue(this.CLASS_NAME), gr.getValue(this.DISCOVERY_SOURCE), lastDiscovered, className);
                count++;
            }
        }
        return count;
    },

    /**
     * Get the potential list of CIs not reported by discovery sources
     * Sort by the last_discovered in descending order so that max value is displayed first
     */
    _getCIsNotReportedByDiscoverySources: function(className, lastDiscoveredColumnMapping) {
        var gr = new GlideRecord(this.MULTISOURCE_DATA);
        gr.addQuery(this.CLASS_NAME, 'INSTANCEOF', className);
        gr.addNotNullQuery(lastDiscoveredColumnMapping);
        gr.orderBy(this.CI);
        gr.orderByDesc(lastDiscoveredColumnMapping);
        gr.setCategory(this.READ_REPLICA_CATEGORY);
        gr.query();
        return gr;
    },

    /**
     * Compare if the last_discovered is older than the max last_discovered by 'n' number of days
     */
    _isLastDiscoveredOlderThanMaxDays: function(lastDiscovered, maxLastDiscovered) {
        var gd1 = new GlideDateTime(lastDiscovered);
        var gd2 = new GlideDateTime(maxLastDiscovered);
        var dur = GlideDateTime.subtract(gd1, gd2);

        return dur.getRoundedDayPart() > this.DISCOVERY_SOURCE_NOT_REPORTING_MAX_DAYS;
    },

    /**
     * Insert a record into the 'sn_cmdb_ws_ms_discovery_sources_not_reporting' table
    */
    _populateDiscoverySourceNotReportingData: function(ci, classname, discoverySource, lastDiscovered) {
        var gr = new GlideRecord(this.DISCOVERY_SOURCES_NOT_REPORTING);
        gr.initialize();
        gr.setValue(this.CI, ci);
        /**
         * Group by CI (Document Id) is currently not working in Multisource dashboard,
         * we need to remove this once that defect is fixed
         * Populating non-cmdb Sys Id into the cmdb_reference field for grouping purpose
         * And also to optimize the check for hierarchy at every row
         * UI will have cmdb_reference column instead of Document Id until the defect is fixed
         */
        gr.setValue(this.CMDB_REFERENCE, ci);
        gr.setValue(this.CLASS_NAME, classname);
        gr.setValue(this.DISCOVERY_SOURCE, discoverySource);
        gr.setValue(this.LAST_DISCOVERED, lastDiscovered);
        gr.setValue(this.STATE, this.DRAFT);
        gr.insert();
    },

    /**
     * Reads data mismatch config table, if no configurations has been defined returns immediately( nothing to process)
     * For every defined config, reads the attributes, condition_type and prepares an 'encoded query' to query multisource database view,
     * adds additional query conditions to filter data and makes a glideaggregate call.
     * Calculates the aggregate count for one config, store it and repeats the process for other configs.
     * Sum of all aggregate counts by config is returned to the caller.
     * @returns count of aggregate data mismatches
     */
    _calculateDataMismatchAggregateCount: function() {
        // read the data_mismatch_config table
        var configs = this._getDataMismatchConfig();
        if (configs.length == 0) {
            gs.error("No configurations defined for data mismatch calculation, cannot calculate data mismatch counts");
            return -1;
        }
        var totalRecords = 0;
        // iterate over the config
        for (var index = 0; index < configs.length; index++) {
            var config = configs[index];
            // prepare the encoded query with AND/OR condition
            var encodedQuery = this._getEncodedDataMismatchQuery(config);
            if (!encodedQuery || encodedQuery === '') {
                gs.error("Error in building encoded query for config with " + global.JSON.stringify(config));
                continue;
            }
            var agg = new GlideAggregate(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW);
            agg.addQuery(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + this.CLASS_NAME, 'INSTANCEOF', config.table);
            if (config.discovery_sources && config.discovery_sources !== '') {
                agg.addQuery(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + this.DISCOVERY_SOURCE, this.IN, config.discovery_sources);
                agg.addQuery(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_2 + this.DISCOVERY_SOURCE, this.IN, config.discovery_sources);
            }
            // Add query to remove duplicate rows between discovery sources, follow only one order betwen sources (A < B)
            agg.addQuery(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + this.DISCOVERY_SOURCE, this.LT_FIELD, this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_2 + this.DISCOVERY_SOURCE);
            agg.addEncodedQuery(encodedQuery, true);
            agg.addAggregate('COUNT');
            agg.setCategory(this.READ_REPLICA_CATEGORY);
            agg.query();
            var records = 0;
            // We issue one aggregate query by one data mismatch config
            if (agg.next()) {
                records = agg.getAggregate('COUNT');
                gs.debug("Data mismatch records for class '" + config.table + "' with encodedQuery '" + encodedQuery + "' is " + records);
                totalRecords += parseInt(records);
            }
        }
        gs.debug("Total records for data mismatch: " + totalRecords);
        return totalRecords;
    },

    /**
     * Populates raw data mismatch records using data mismatch config
     * Iterates over the data mismatch config and populate data mismatch records, if aggregate data mismatch count is greater than max rows to write,
     * calculates the percentage of raw data mismatch records for each class and limits results to that limit
     * @param {*} aggDataMismatchCount aggregate count of data mismatch records
     * @returns
     */
    _populateDataMismatchRawData: function(aggDataMismatchCount) {
        // read the data_mismatch_config table
        var configs = this._getDataMismatchConfig();
        if (configs.length == 0) {
            gs.error("No configurations defined for data mismatch calculation, cannot populate data mismatch records");
            return;
        }
        // iterate over the config
        for (var index = 0; index < configs.length; index++) {
            var config = configs[index];
            // prepare the encoded query with AND/OR condition
            var encodedQuery = this._getEncodedDataMismatchQuery(config);
            if (!encodedQuery || encodedQuery === '') {
                gs.error("Error in building encoded query for config with " + global.JSON.stringify(config));
                continue;
            }
            var maxRowsToWrite = this.MULTISOURCE_REPORT_MAX_LIMIT;
            // When total aggregate data mismatch count is greater than max limit, we store partial data in raw mismatch table
            if (aggDataMismatchCount > this.MULTISOURCE_REPORT_MAX_LIMIT) {
                maxRowsToWrite = this.MULTISOURCE_REPORT_MAX_LIMIT * config.ci_count_percent / 100;
            }
            this._executeAndPopulateRawDataMismatch(encodedQuery, config, maxRowsToWrite);
        }
    },

    /**
     * Prepares the glide record with diff query view, adds encoded query based on input config, executes the query and store results
     * If input config has available discovery sources, diff will be applied with only those discovery sources.
     * If input config has no available discovery sources, diff will be applied for all discovery sources in the system
     * @param {*} encodedQuery evaluated query condition using diff fields from config
     * @param {*} config data mismatch config defined for one class ( diff fields, condition_type, percentage)
     * @param {*} maxRowsToWrite maximum number of rows to write for this config
     * @returns
     */
    _executeAndPopulateRawDataMismatch: function(encodedQuery, config, maxRowsToWrite) {
        var msGr = new GlideRecord(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW);
        msGr.addQuery(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + this.CLASS_NAME, 'INSTANCEOF', config.table);
        if (config.discovery_sources && config.discovery_sources !== '') {
            msGr.addQuery(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + this.DISCOVERY_SOURCE, this.IN, config.discovery_sources);
            msGr.addQuery(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_2 + this.DISCOVERY_SOURCE, this.IN, config.discovery_sources);
        }
        // Add query to remove duplicate rows between discovery sources, follow only one order betwen sources (A < B)
        msGr.addQuery(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + this.DISCOVERY_SOURCE, this.LT_FIELD, this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_2 + this.DISCOVERY_SOURCE);
        msGr.addEncodedQuery(encodedQuery, true);
        msGr.chooseWindow(0, maxRowsToWrite);
        msGr.setCategory(this.READ_REPLICA_CATEGORY);
        msGr.query();
        var mappedColumnsArr = this._getMappedColumnsDataMismatch(config);
        this._writeRawDataMismatchRecords(msGr, mappedColumnsArr, maxRowsToWrite);

    },
    /**
     * Reads data from multisource diff query view glide record, populate data mismatch records from multisource glide record,
     * Also populate the diff fields( use mapped columns to get the display name) and discovery sources
     * @param {*} msGr GlideRecord of diff query view with all encoded conditions
     * @param {*} mappedColumns Map of column -> { display name, column name}
     * Ex: col51 -> fqdn, fully Qualified Domain Name
     * @returns
     */
    _writeRawDataMismatchRecords: function(msGr, mappedColumns, maxRowsToWrite) {
        if (!msGr) {
            gs.error("Failed to receive multisource glide record for populating data into workspace raw data table");
            return;
        }
        var dataMismatchGr = new GlideRecord(this.DATA_MISMATCH);
        var rowWrittenCount = 0;
        while (msGr.next()) {
            // read fields from multisource
            var ci = msGr.getValue(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + this.CI);
            var clazz = msGr.getValue(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + this.CLASS_NAME);
            var source1 = msGr.getValue(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + this.SYS_ID);
            var source2 = msGr.getValue(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_2 + this.SYS_ID);

            for (var index in mappedColumns) {
                var columnObj = mappedColumns[index];
                var leftMappedColumnValue = msGr.getValue(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + columnObj.indexedColumn);
                var rightMappedColumnValue = msGr.getValue(this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_2 + columnObj.indexedColumn);
                /**
                 * In case of OR condition, few selected attributes might have same value on both sides (left and right), and some
                 * attributes might have different values. DB will return a row when atleast one of the selected attributes has different value for
                 * OR condition, we don't want to populate raw data records for those attributes where attribute value is same( left == right).
                 * This situation doesn't happen for AND condition and we need to handle it explicitly
                 */
                if (leftMappedColumnValue && rightMappedColumnValue && leftMappedColumnValue !== rightMappedColumnValue) {
                    dataMismatchGr.initialize();
                    // populate fields in data mismatch table
                    dataMismatchGr.setValue(this.CLASS_NAME, clazz);
                    dataMismatchGr.setValue(this.CI, ci);
                    /**
                        * Group by CI (Document Id) is currently not working in Multisource dashboard,
                        * we need to remove this once that defect is fixed
                        * Populating non-cmdb Sys Id into the cmdb_reference field for grouping purpose
                        * And also to optimize the check for hierarchy at every row
                        * UI will have cmdb_reference column instead of Document Id until the defect is fixed
                    */
                    dataMismatchGr.setValue(this.CMDB_REFERENCE, ci);
                    dataMismatchGr.setValue(this.DIFF_FIELD, columnObj.displayName);

                    dataMismatchGr.setValue(this.CLASS_1, this.MULTISOURCE_DATA);
                    dataMismatchGr.setValue(this.SOURCE_1, source1);
                    dataMismatchGr.setValue(this.SOURCE_1_VALUE, leftMappedColumnValue);

                    dataMismatchGr.setValue(this.CLASS_2, this.MULTISOURCE_DATA);
                    dataMismatchGr.setValue(this.SOURCE_2, source2);
                    dataMismatchGr.setValue(this.SOURCE_2_VALUE, rightMappedColumnValue);

                    dataMismatchGr.setValue(this.STATE, this.DRAFT);
                    dataMismatchGr.insert();
                    rowWrittenCount++;

                }
            }
            if (rowWrittenCount >= maxRowsToWrite) {
                // Wrote required number of rows to data mismatch table, avoiding further processing
                return;
            }
        }
    },

    /**
     *
     * Calculate the indexed column, display name of the columns defined in config.
     * Prepare an array of objects ( each object representing indexed column, display name and column name)
     * @param {*} config
     * @returns An example of return value for input config
        [
            {
                'indexedColumn': 'col51',
                'displayName': 'Fully Qualified Domain Name'
                'columnName' : 'fqdn'
            },
            {
                'indexedColumn': 'col52',
                'displayName': 'RAM(MB)'
                'columnName' : 'ram'
            }
        ]
     */
    _getMappedColumnsDataMismatch: function(config) {
        var mappedColumnsArr = [];
        var attributes = config.attributes.split(",");
        var columnName2DisplayNameMap = sn_cmdb.MultiSourceAnalytics.getColumnMap(config.table);
        for (var index in attributes) {
            var indexedColumn = this._getIndexedColumn(config.table, attributes[index]);
            var displayName = columnName2DisplayNameMap[attributes[index]];
            var mappedColumns = {
                'indexedColumn': indexedColumn,
                'displayName': displayName,
                'columnName': attributes[index]
            };
            mappedColumnsArr.push(mappedColumns);
        }
        return mappedColumnsArr;
    },

    /**
     * Prepares an encoded query with multisource view prefixes and also replace with OR/AND based on specified condition_type
     * Comma separated list of attributes are separated and indexed columns for each attribute is calculated and used in the encoded query
     * @param {config} config
     * @returns encoded query in string format
     */
    _getEncodedDataMismatchQuery: function(config) {
        var attributes = config.attributes.split(",");
        var operator = (config.condition_type == 1) ? '^OR' : '^';
        var encodedQuery = '';
        for (var i = 0; i < attributes.length; i++) {
            if (i != 0) {
                encodedQuery += operator;
            }
            var indexedColumn = this._getIndexedColumn(config.table, attributes[i].trim());
            if (indexedColumn && indexedColumn !== '') {
                encodedQuery += this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_1 + indexedColumn + 'NSAMEAS'+ this.CMDB_MULTISOURCE_DIFF_QUERY_VIEW_PREFIX_2+ indexedColumn;
            } else {
                gs.error("Failed to find the indexed column for class '" + config.table + "' and attribute '" + attributes[i].trim() + "'");
                return;
            }
        }
        return encodedQuery;
    },

    /**
     *
     * @param {String} className className in CMDB hierarchy
     * @param {String} columnName column defined in className of CMDB
     * Iterates over all the defined mappings and finds the right indexed column used for column name
     * @returns the mapping of column name to indexed column.
     * Example: "fqdn"->"col12", "cpu_count"->"col13"}
     */
    _getIndexedColumn: function(className, columnName) {
        var columnMapping = this._getMultisourceColumnMappingByClass(className);
        if (!columnMapping) {
            gs.error("Failed to find the column mapping for " + className);
            return;
        }
        return columnMapping[columnName.trim()];
    },

    /**
     * Read the column metadata from the cmdb_multisource_column_metadata table and prepare of Map of class Name -> {attributeName-> indexedColumnName}
     * Ex:- {cmdb_ci_linux_server ->{"fqdn"->"col12", "cpu_count"->"col13"}}
     */
    _populateColumnMapping: function() {
        var columnMapping = {};
        var gr = new GlideRecord(this.MULTISOURCE_COLUMN_METADATA);
        gr.query();
        while (gr.next()) {
            var className = gr.getValue(this.TABLE);
            if (!columnMapping[className]) {
                columnMapping[className] = {};
            }
            var indexedField = gr.getValue(this.MS_TABLE_FIELD);
            var field = gr.getValue(this.FIELD);
            columnMapping[className][field] = indexedField;
        }
        return columnMapping;
    },

    /**
     * Calculates the mapped columns defined at all levels from the input className to cmdb, walking up the hierarchy
     * @param className classname in CMDB
     * @returns map of column names -> indexed columns
     * Ex: {"fqdn"-> "col1", "host_name"-> "col2"}
     */
    _getMultisourceColumnMappingByClass: function(className) {
        var table = new GlideTableHierarchy(className);
        var parents = table.getTables();
        var hierarchicalColumnMappingMetadata = {};
        if (!this.columnMetadataMapping) {
            gs.error("Failed to find the default multisource column metadata from cache");
            return;
        }
        for (var i = 0; i < parents.length; i++) {
            gs.debug("Reading column metadata mapping for " + parents[i]);
            var columnMetadataMappingByClass = this.columnMetadataMapping[parents[i]];
            if (columnMetadataMappingByClass) {
                for (var x in columnMetadataMappingByClass) {
                    // If the mapping is defined at child class, don't add the parent class mapping
                    if (!hierarchicalColumnMappingMetadata[x]) {
                        hierarchicalColumnMappingMetadata[x] = columnMetadataMappingByClass[x];
                    }
                }
            }
        }
        return hierarchicalColumnMappingMetadata;
    },

    /**
     * Read the data mismatch config rows from the table and returns config objects
     * @returns empty when no config is available otherwise list of config objects
     */
    _getDataMismatchConfig: function() {
        var configs = [];
        var gr = new GlideRecord(this.DATA_MISMATCH_CONFIG);
        gr.query();
        while (gr.next()) {
            var config = {
                "table": gr.getValue(this.TABLE),
                "ci_count_percent": gr.getValue(this.CI_COUNT_PERCENT),
                "attributes": gr.getValue(this.ATTRIBUTES),
                "condition_type": gr.getValue(this.CONDITION_TYPE),
                "discovery_sources": gr.getValue(this.DISCOVERY_SOURCES)
            };
            configs.push(config);
        }
        return configs;
    },

    /**
     * Check if the tableName extends from the parentTableName.
     * For example, tableName is windows server and parentTableName is hardware, it will return true.
     * @param tableName
     * @param parentTableName
     * @returns
     */
    _extendsFromTable: function(tableName, parentTableName) {
        var table = new GlideTableHierarchy(tableName);
        var parentTables = table.getTables();
        return parentTables.indexOf(parentTableName) >= 0;
    },

   /**
     * If current table is non-cmdb table, check if non-cmdb population for multisource is disabled or cmdb only coverage is enabled
     * @param tableName
     * @returns
     */
   _skipNonCMDBDataPopulation: function(tableName) {
    if (this._extendsFromTable(tableName, this.CMDB_CI)) {
        return false;
    }
    // If multisource property to collect non cmdb ci is disabled, avoid using non cmdb data in coverage charts
    // If customer chooses to calculate data for cmdb cis only in dashboard, honor that setting
    return !this.MULTISOURCE_NON_CMDB_CI_ENABLED || this.MULTISOURCE_CALCULATE_CMDB_ONLY ;
},

    _getClassCICounts: function() {
        var result = [];

        var ga = new GlideAggregate(this.MULTISOURCE_DATA);
        ga.addAggregate('COUNT', this.CI);
        ga.groupBy(this.CLASS_NAME);
        ga.query();
        while (ga.next()) {
            var classCount = {
                class_name: ga.getValue(this.CLASS_NAME),
                ci_count: ga.getAggregate('COUNT', this.CI)
            };
            result.push(classCount);
        }

        return result;
    },

    /**
     * 1. Remove the classes that exceed the max class count threshold or are among the CMDB 360 denied classes or non-cmdb classes
     * 2. Re-arrage the result so classes defined in the class config are inserted in the beginning, followed by the hardware classes and lastly all remaining classes
     *
     * @returns classCICounts
     */
    _filterClassCICounts: function(classCICounts, coverageChartClassConfig) {
        var validClassCICounts = [];

        // Filter the invalid classes from the classCICounts array
        for (var i = 0; i < classCICounts.length; i++) {
            var isValid = true;
            var classCICount = classCICounts[i];
            if (classCICount.ci_count > this.MULTISOURCE_REPORT_CLASS_CI_COUNT_MAX_THRESHOLD) {
                isValid = this._handleAboveThresholdClass(classCICount.class_name);
            } else if (this.skippedClasses[classCICount.class_name]) {
                // Class CI count is less than threshold. Check if we had previously skipped the class and update it for cleanup
                this._updateMultisourceSkippedClass(classCICount.class_name, false);
            }

            // Check if cmdb only population is enabled and class is not amongst deny list classes
            if (isValid && this._skipNonCMDBDataPopulation(classCICount.class_name)) {
                gs.debug("Skip populating coverage charts for non-CMDB table: " + classCICount.class_name);
                isValid = false;
            } else if (isValid && this.multiSourceDenyList[classCICount.class_name]) {
                gs.debug("Skip populating coverage charts for CMDB 360 denied class: " + classCICount.class_name);
                isValid = false;
            }

            // Consider the class as valid as it has passed all the required checks
            if (isValid) {
                validClassCICounts.push(classCICount);
            }
        }

        // Add the classes defined in the class config at the beginning of the result, followed by classes extending cmdb_ci_hardware and lastly any remaining classes
        validClassCICounts.sort(function (a, b) {
            // Check if both class names exist in the configuration
            var aConfig = coverageChartClassConfig[a.class_name];
            var bConfig = coverageChartClassConfig[b.class_name];

            if (!aConfig && bConfig) {
                return 1;   // If only b is configured, b should come before a
            } else if (!bConfig && aConfig) {
                return -1;  // If only a is configured, a should come before b
            }

            // If percentages are equal, compare based on table inheritance
            var aExtendsHardware = this._extendsFromTable(a.class_name, this.HARDWARE);
            var bExtendsHardware = this._extendsFromTable(b.class_name, this.HARDWARE);

            // Sort by table inheritance
            if (aExtendsHardware && !bExtendsHardware) {
                return -1;  // If only a extends cmdb_ci_hardware, a should come before b
            } else if (!aExtendsHardware && bExtendsHardware) {
                return 1;   // If only b extends cmdb_ci_hardware, b should come before a
            } else {
                return 0;   // If neither or both classes extend cmdb_ci_hardware, maintain the current order
            }
        }.bind(this));

        return validClassCICounts;
    },

    /**
     * Check if class config is defined for the given class name. Traverse up the parent hierarchy to see if the config is defined
     * For example, config is defined at the hardware level and we have windows server class. We need to traverse up the hierarchy to get the config
     * @param className
     */
    _getCoverageChartClassConfigs: function(classCICounts) {
        var result = {};

        for (var i = 0; i < classCICounts.length; i++) {
            var className = classCICounts[i].class_name;
            var tables = new GlideTableHierarchy(className).getTables();
            for (var j = 0; j < tables.length; j++) {
                var table = tables[j];
                if (this.classConfig[table]) {
                    result[className] = this.classConfig[table];
                    break;
                }
            }
        }
        return result;
    },

    _getPrincipalClasses: function() {
        var result = {};
        var gr = new GlideRecord(this.CMDB_CLASS_INFO);
        gr.addQuery(this.PRINCIPAL_CLASS, true);
        gr.query();
        while (gr.next()) {
            result[gr.getValue(this.CLASS_NAME)] = true;
        }
        return result;
    },

    _getFilterMappings: function() {
        var filterMappings = {};
        var gr = new GlideRecord(this.CI_FILTER);
        gr.query();
        while (gr.next()) {
            var filter = {
                sys_id: gr.getValue(this.SYS_ID),
                query: gr.getValue(this.ENCODED_QUERY)

            }
            var filterName = gr.getValue(this.NAME);
            filterMappings[filterName] = filter;
        }

        return filterMappings;
    },

    /**
     * Populate aggregate data for single source coverage chart
     * This method computes aggregate data for each filter for the single source coverage chart
     */
    _populateSingleSourceAggregateData: function() {
        // Result object to store the final aggregate counts for each filter for each discovery source
        var result = {};

        var gr = this._getClassCountByChartGr(this.CHART_CIS_WITH_SINGLE_SOURCE, this.DRAFT);
        while (gr.next()) {
            this._updateAggregateCountsForFilters(gr.getValue(this.CLASS_NAME), gr.getValue(this.KEY), result, parseInt(gr.getValue(this.VALUE)));
        }

        // Special scenario for single source chart when there are no aggregate records.
        if (Object.keys(result).length == 0) {
            gs.debug("Found 0 records for CIs with single source chart");
            for (var filter in this.filterMappings) {
                this._populateMultisourceDashboardData(this.CHART_CIS_WITH_SINGLE_SOURCE, this.ZERO_CIS_WITH_A_SINGLE_SOURCE_KEY, this.ZERO_CIS_WITH_A_SINGLE_SOURCE_VALUE, this.DRAFT, filter);
            }
            return;
        }

        // Populate aggregate counts for each key (number of sources or discovery source) and each filter in the dashboard table
        for (var key in result) {
            var filterCounts = result[key];
            for (var filter in filterCounts) {
                if (filterCounts[filter] != 0) {
                    this._populateMultisourceDashboardData(this.CHART_CIS_WITH_SINGLE_SOURCE, key, filterCounts[filter], this.DRAFT, filter);
                }
            }
        }
    },

    /**
     * Populate aggregate data for number of sources coverage chart
     * This method computes aggregate data for each filter for the number source coverage chart
     */
    _populateNumberSourceAggregateData: function() {
        // Result object to store the final aggregate counts for each filter for each discovery source
        var result = {};

        var gr = this._getClassCountByChartGr(this.CHART_CIS_BY_NUMBER_OF_SOURCES, this.DRAFT);
        while (gr.next()) {
            this._updateAggregateCountsForFilters(gr.getValue(this.CLASS_NAME), gr.getValue(this.KEY), result, parseInt(gr.getValue(this.VALUE)));
        }

        // Populate aggregate counts for each key (number of sources or discovery source) and each filter in the dashboard table
        for (var key in result) {
            var filterCounts = result[key];
            for (var filter in filterCounts) {
                this._populateMultisourceDashboardData(this.CHART_CIS_BY_NUMBER_OF_SOURCES, key, filterCounts[filter], this.DRAFT, filter);
            }
        }
    },

    /**
     * Update the aggregate count for given key (can be source number e.g. 1, 2, 3 etc. or discovery source e.g. ServiceNow, ServiceWatch etc.).
     * The current implementation only supports all, cmdb_ci and principal class filters.
     * @param className
     * @param key
     * @param aggregateCountsWithFilters
     * @param count
        {
            1: {
                all: 50000,
                cmdb_ci: 40000,
                principal_class: 10000
            },
            2: {
                all: 40000,
                cmdb_ci: 10000,
                principal_class: 20000
            }
            .
            .
            .
            5+: {
                all: 50000,
                cmdb_ci: 10000,
                principal_class: 30000,
            }
        }
     */
    _updateAggregateCountsForFilters: function(className, key, aggregateCountsWithFilters, count) {
        if (!aggregateCountsWithFilters[key]) {
            aggregateCountsWithFilters[key] = {};
            for (var filter in this.filterMappings) {
                aggregateCountsWithFilters[key][filter] = 0;
            }
        }

        aggregateCountsWithFilters[key][this.ALL_FILTER] += count;

        if (this._extendsFromTable(className, this.CMDB_CI)) {
            aggregateCountsWithFilters[key][this.CMDB_CI_FILTER] += count;
        }

        if (this.principalClasses[className]) {
            aggregateCountsWithFilters[key][this.PRINCIPAL_CLASS_FILTER] += count;
        }

        // TODO: Add logic to update custom filter counts here in future releases
    },

    _populateChartClassCICount: function(chart, className, key, value, state) {
        var gr = new GlideRecord(this.CHART_CLASS_CI_COUNT);
        gr.initialize();
        gr.setValue(this.CHART, chart);
        gr.setValue(this.KEY, key);
        gr.setValue(this.VALUE, value);
        gr.setValue(this.STATE, state);
        gr.setValue(this.CLASS_NAME, className);
        gr.insert();
    },

    _populateClassCICounts: function(classCICounts, state) {
        for (var i = 0; i < classCICounts.length; i++) {
            var classCICount = classCICounts[i];
            var gr = new GlideRecord(this.CLASS_CI_COUNT);
            gr.initialize();
            gr.setValue(this.CI_COUNT, classCICount.ci_count);
            gr.setValue(this.STATE, state);
            gr.setValue(this.CLASS_NAME, classCICount.class_name);
            gr.insert();
        }
    },

    _getClassCountByChartGr: function(chart, state) {
        var gr = new GlideRecord(this.CHART_CLASS_CI_COUNT);
        gr.addQuery(this.CHART, chart);
        gr.addQuery(this.STATE, state);
        gr.query();

        return gr;
    },

    /**
     * Get the max limit for given class. If the class has config defined, get the limit using the config data.
     * Otherwise, get the limit based on the max report limit and count of CIs populated so far
     * @param className
     * @param coverageChartClassConfig
     * @param populatedCICount
     * @param maxNumberSourceCount
     * @param maxSources
     * @returns
     */
    _getNumberSourceMaxLimit: function(className, coverageChartClassConfig, populatedCICount, maxSources) {
        var classConfigEntry = coverageChartClassConfig[className];
        if (classConfigEntry) {
            return Math.round(((this.MULTISOURCE_REPORT_MAX_LIMIT * (classConfigEntry.ci_count_percent / 100)) - classConfigEntry.current_ci_count.number_source_count) / maxSources);
        }

        var maxLimit = Math.round((this.MULTISOURCE_REPORT_MAX_LIMIT - populatedCICount) / maxSources);

        return maxLimit;
    },

    /**
     * Get the max limit for given class. If the class has config defined, get the limit using the config data.
     * Otherwise, get the limit based on the max report limit and count of CIs populated so far
     * @param className
     * @param coverageChartClassConfig
     * @param populatedCICount
     * @returns
     */
    _getSingleSourceMaxLimit: function(className, coverageChartClassConfig, populatedCICount) {
        var classConfigEntry = coverageChartClassConfig[className];
        if (classConfigEntry) {
            return Math.round((this.MULTISOURCE_REPORT_MAX_LIMIT * (classConfigEntry.ci_count_percent / 100)) - classConfigEntry.current_ci_count.single_source_count);
        }

        var maxLimit = this.MULTISOURCE_REPORT_MAX_LIMIT - populatedCICount;

        return maxLimit;
    },

    /**
     * Update the coverage chart class ci counts so that the next class within the same hierarchy can get the max limit correctly.
     * @param coverageChartClassConfig
     * @param className
     * @param numberSourcePopulatedCICount
     * @param singleSourcePopulatedCICount
     */
    _updateCoverageChartCurrentCICounts: function(coverageChartClassConfig, className, numberSourcePopulatedCICount, singleSourcePopulatedCICount) {
        var classConfigEntry = coverageChartClassConfig[className];
        if (classConfigEntry) {
            coverageChartClassConfig[className].current_ci_count.number_source_count += numberSourcePopulatedCICount;
            coverageChartClassConfig[className].current_ci_count.single_source_count += singleSourcePopulatedCICount;
        }
    },

    _updateSourceCICount: function(sourceCICounts, discoverySource) {
        if (typeof sourceCICounts[discoverySource] === 'undefined') {
            sourceCICounts[discoverySource] = 1;
        } else {
            sourceCICounts[discoverySource] = sourceCICounts[discoverySource] + 1;
        }
    },

    _getMultisourceDenyList: function () {
        var denyClassesMap = {};
        var gr = new GlideRecord(this.CMDB_MULTISOURCE_DENY_CLASS);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var parentClassName = gr.getValue(this.CLASS_NAME);
            var extensions = new GlideTableHierarchy(parentClassName).getAllExtensions();
            for (var i = 0; i < extensions.length; ++i) {
                var className = extensions[i] + "";
                if (!denyClassesMap[className]) {
                    denyClassesMap[className] = true;
                }
            }
        }
        return denyClassesMap;
    },

    _getSkippedClasses: function() {
        var result = {};
        var gr = new GlideRecord(this.CMDB_MULTISOURCE_REPORT_SKIPPED_CLASS);
        gr.query();
        while (gr.next()) {
            var classInfo = {
                is_system_updated: gr.getValue(this.IS_SYSTEM_UPDATED) == "0" ? false : true,
                is_user_updated: gr.getValue(this.IS_USER_UPDATED) == "0" ? false : true
            }
            result[gr.getValue(this.CLASS_NAME)] = classInfo;
        }
        return result;
    },

    _handleAboveThresholdClass: function(className) {
        var result;
        if (this.skippedClasses[className]) {
            this._updateMultisourceSkippedClass(className, true);
            // Even if the class CI count is greter than sn_cmdb_ws.ms.report_class_ci_count_max_threshold, users can override it to be included in the chart population
            result = this.skippedClasses[className].is_user_updated;
        } else {
            this._insertMultisourceSkippedClass(className, true);
            result = false;
        }

        if (result) {
            gs.debug("Number of multisource records for " + className + " is greater than multisource report class count max threshold "
            + this.MULTISOURCE_REPORT_CLASS_CI_COUNT_MAX_THRESHOLD + ". User has overridden record population for class " + className + ". Including class in dashboard data population");
        } else {
            gs.debug("Number of multisource records for " + className + " is greater than multisource report class count max threshold "
            + this.MULTISOURCE_REPORT_CLASS_CI_COUNT_MAX_THRESHOLD + ". Skipping dashboard data population for class " + className);
        }
        return result;
    },

    _insertMultisourceSkippedClass: function(className, isSystemUpdated) {
        var gr = new GlideRecord(this.CMDB_MULTISOURCE_REPORT_SKIPPED_CLASS);
        gr.initialize();
        gr.setValue(this.CLASS_NAME, className);
        gr.setValue(this.IS_SYSTEM_UPDATED, isSystemUpdated);
        gr.insert();
    },

    _updateMultisourceSkippedClass: function(className, isSystemUpdated) {
        var gr = new GlideRecord(this.CMDB_MULTISOURCE_REPORT_SKIPPED_CLASS);
        gr.addQuery(this.CLASS_NAME, className);
        gr.setValue(this.IS_SYSTEM_UPDATED, isSystemUpdated);
        gr.updateMultiple();
    },

    /**
     * Delete the unwanted records from the sn_cmdb_ws_ms_skip_class table
     * @param classCICounts
     */
    _cleanupSkippedClasses: function(classCICounts) {
        var classNames = [];
        var batchSize = 100;

        for (var i = 0; i < classCICounts.length; i++) {
            classNames.push(classCICounts[i].class_name);
        }

        for (var j = 0; j < classNames.length; j += batchSize) {
            var chunk = classNames.slice(j, j + batchSize);
            var gr = new GlideRecord(this.CMDB_MULTISOURCE_REPORT_SKIPPED_CLASS);
            gr.addQuery(this.CLASS_NAME, this.IN, chunk);
            gr.addQuery(this.IS_SYSTEM_UPDATED, false);
            gr.addQuery(this.IS_USER_UPDATED, false);
            gr.deleteMultiple();
        }
    },

    type: 'MultiSourceQueryProcessor'
};
