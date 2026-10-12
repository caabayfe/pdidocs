var ConfigurationExecutor = Class.create();
ConfigurationExecutor.prototype = {
    initialize: function() {
        this.logger = new WdfLogger();
    },

    executeConfigurations: function(startDate, endDate) {
        if (!startDate) {
            throw "Invalid start date: " + startDate;
        }

        if (!endDate) {
            throw "Invalid end date: " + endDate;
        }

        this.logger.info("Executing active usage configurations from " + startDate.getByFormat("yyyy-MM-dd") + " to " + endDate.getByFormat("yyyy-MM-dd") + ".");
        var configurationStore = new ConfigurationStore();
        var usageConfigurationGR = configurationStore.getActiveConfigurations();

        while (usageConfigurationGR.next()) {
            try {
                this.executeConfiguration(usageConfigurationGR, startDate, endDate);
            } catch (e) {
                this.logger.error("Failed to execute usage configuration: " + usageConfigurationGR.getUniqueValue() + " due to " + e);
            }
        }
    },

    executeConfiguration: function(usageConfigurationGR, startDate, endDate) {
        if (!usageConfigurationGR) {
            throw "Invalid usage configuration record: " + usageConfigurationGR;
        }

        if (!startDate) {
            throw "Invalid start date: " + startDate;
        }

        if (!endDate) {
            throw "Invalid end date: " + endDate;
        }

        this.logger.debug("Executing usage configuration: " + usageConfigurationGR.getUniqueValue());

        var uaDefinitionId = usageConfigurationGR.getValue("ua_definition_id");
        var schedule = usageConfigurationGR.getValue("schedule");
        var uaCountGR = this.getUaCountRecords(uaDefinitionId, schedule, startDate, endDate);

        while (uaCountGR.next()) {
            try {
                this.logger.debug("Processing UA count record: " + uaCountGR.getUniqueValue());
                var usageResult = new UsageResult(usageConfigurationGR.getUniqueValue());

                var datestamp = this.getDatestamp(uaCountGR);
                usageResult.setDatestamp(datestamp);
                this.logger.debug("Calculated datestamp: " + datestamp);

                var nativeAmount = this.calculateUsageOnUaCountRecord(uaCountGR);
                usageResult.setNativeAmount(nativeAmount);
                this.logger.debug("Calculated unit amount: " + nativeAmount);

                var tokenAmount = this.convertUnitToToken(usageConfigurationGR, nativeAmount);
                usageResult.setTokenAmount(tokenAmount);
                this.logger.debug("Calculated token amount: " + tokenAmount);

                usageResult.setResult("success");
            } catch (e) {
                this.logger.error("Failed to calculate usage on UA count: " + uaCountGR.getUniqueValue() + " due to " + e);
                usageResult.setError(e);
            }

            this.logger.debug("Result: " + usageResult.toString());

            this.persistUsageResult(usageResult);
        }
    },

    getUsageCompositionRecord: function(usageResult) {
        var usageCompositionGR = new GlideRecord("sn_wdf_token_usage_composition");
        usageCompositionGR.addQuery("usage_configuration", usageResult.getUsageConfiguration());
        usageCompositionGR.addQuery("datestamp", usageResult.getDatestamp());
        usageCompositionGR.setLimit(1);
        usageCompositionGR.query();

        return usageCompositionGR;
    },

    persistUsageResult: function(usageResult) {
        if (!usageResult.getDatestamp()) {
            this.logger.debug("Cannot persist result with invalid datestamp: " + usageResult.getDatestamp());
            return;
        }

        var existingUsageCompositionGR = this.getUsageCompositionRecord(usageResult);
        var tokenAmount = usageResult.getTokenAmount();

        if (tokenAmount < 0) {
            this.logger.debug("Resetting negative token amount to 0");
            tokenAmount = 0;
        }

        if (!existingUsageCompositionGR.next()) {
            var usageCompositionGR = new GlideRecord("sn_wdf_token_usage_composition");
            usageCompositionGR.setValue("usage_configuration", usageResult.getUsageConfiguration());
            usageCompositionGR.setValue("native_amount", usageResult.getNativeAmount());
            usageCompositionGR.setValue("token_amount", tokenAmount);
            usageCompositionGR.setValue("datestamp", usageResult.getDatestamp());
            usageCompositionGR.setValue("result", usageResult.getResult());
            usageCompositionGR.setValue("notes", usageResult.getNotes());

            var sysId = usageCompositionGR.insert();

            this.logger.debug("Storing usage result into usage composition record: " + sysId);
            return sysId;
        } else if (existingUsageCompositionGR.getValue("result") === "failure") {
            existingUsageCompositionGR.setValue("native_amount", usageResult.getNativeAmount());
            existingUsageCompositionGR.setValue("token_amount", tokenAmount);
            existingUsageCompositionGR.setValue("result", usageResult.getResult());
            existingUsageCompositionGR.setValue("notes", usageResult.getNotes());

            existingUsageCompositionGR.update();
            this.logger.debug("Updated usage result into usage composition record: " + sysId);
            return sysId;
        } else {
            this.logger.debug("Valid composition record already exists.");
            return;
        }
    },

    getDatestamp: function(uaCountGR) {
        var dayFormat = /^\d{4}-\d{2}-\d{2}$/;
        var monthFormat = /^\d{4}-\d{2}$/;
        var accrualPeriod = uaCountGR.getValue("time_stamp").trim();

        if (dayFormat.test(accrualPeriod)) {
			// Throw error if monthly definition is formatted as daily datestamp 
			if (uaCountGR.getValue("schedule").trim() === "Monthly") {
				throw "Invalid accrual period value: " + accrualPeriod + " for monthly definition: " + uaCountGR.getValue("definition_id");
			}

            var date = new GlideDate();
            date.setValue(accrualPeriod);
            this.logger.debug("Matches on daily accrual period format.");
            return date;
        } else if (monthFormat.test(accrualPeriod)) {
            this.logger.debug("Matches on monthly accrual period format.");
            var datetime = new GlideDateTime(accrualPeriod + "-10");
            datetime.setDayOfMonthUTC(32);
            return datetime.getDate();
        } else {
            throw "Invalid accrual period value: " + accrualPeriod;
        }
    },

    calculateUsageOnUaCountRecord: function(uaCountGR) {
        return uaCountGR.getValue("count");
    },

    convertUnitToToken: function(usageConfigurationGR, nativeAmount) {
        var exchangeValue = usageConfigurationGR.getValue("exchange_value");
        //validate strategy with PM
        return Math.floor(nativeAmount * exchangeValue);
    },

    getUaCountRecords: function(uaDefinitionId, schedule, startDate, endDate) {

        var uaCountGR = new GlideRecord("usageanalytics_count");
        uaCountGR.addQuery("definition_id", uaDefinitionId);

        if (schedule === "Days") {
            uaCountGR.addQuery("time_stamp", ">=", startDate.getByFormat("yyyy-MM-dd"));
            uaCountGR.addQuery("time_stamp", "<=", endDate.getByFormat("yyyy-MM-dd"));
        } else {
            uaCountGR.addQuery("time_stamp", ">=", startDate.getByFormat("yyyy-MM"));
            uaCountGR.addQuery("time_stamp", "<=", endDate.getByFormat("yyyy-MM"));
        }

        uaCountGR.query();

        this.logger.debug("Querying UA Count table with query: " + uaCountGR.getEncodedQuery() + ", and found " + uaCountGR.getRowCount() + " record(s).");

        return uaCountGR;
    },

    type: 'ConfigurationExecutor'
};
