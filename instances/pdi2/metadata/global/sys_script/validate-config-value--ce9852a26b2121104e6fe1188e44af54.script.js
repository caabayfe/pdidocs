(function executeRule(current, previous /*null when async*/ ) {
    try {
        var configName = current.getValue("configuration_name");
		var configLabel = current.getValue("configuration_label");
        var type = current.automated_finding.type;
        var configValue = parseInt(current.getValue("configuration_value"));

        if ((type == "REWORK" || type == "PATTERN") && configName == "minRepetitions" && configValue < 2) {
            throw getConfigErrorMsg(configLabel, "2");
        } else if (type != "REWORK" && type != "PATTERN" && configName == "minRepetitions" && configValue < 1) {
            throw getConfigErrorMsg(configLabel, "1");
        } else if (configName == "maxFindings" && configValue < 0) {
            throw getConfigErrorMsg(configLabel, "0");
        } else if (type == "EXTRA_STEP" && configName == "minRatio" && configValue < 1) {
            throw getConfigErrorMsg(configLabel, "1");
        } else if (type == "EXTRA_STEP" && configName == "maxRatio" && configValue < 0) {
            throw getConfigErrorMsg(configLabel, "0");
        } else if (type == "EXTRA_STEP" && configName == "minRecordNumber" && configValue < 100) {
            throw getConfigErrorMsg(configLabel, "100");
        } else if (type == "EXTRA_STEP" && configName == "minEventNumber" && configValue < 4) {
            throw getConfigErrorMsg(configLabel, "4");
        } else if (type == "PATTERN" && configName == "minLength" && configValue < 3) {
            throw getConfigErrorMsg(configLabel, "3");
        }

        //Extreme outlier detector config
        if (type == "EXTREME_DURATION" || type == "EXTREME_REPETITION"
        	|| type == "EXTREME_NODE_TOUCH_POINT" || type == "EXTREME_NODE_DURATION") {
            if (configName == "maxDetectedRecords" && configValue < 1) {
                throw getConfigErrorMsg(configLabel, "1");
            }
            if ((configName == "repetitionMultiplier" ||
                    configName == "durationMultiplier" ||
                    configName == "touchPointMultiplier") && configValue < 10) {
                throw getConfigErrorMsg(configLabel, "10");
            }
            if (configName == "minTotalRecords" && configValue < 20) {
                throw getConfigErrorMsg(configLabel, "20");
            }
        }

        //Slow node and arc duration (Performance outlier detector)
        if (type == 'PERFORMANCE_OUTLIER' || type == 'NODE_DURATION_OUTLIER' || type == 'NODE_TOUCH_POINT_OUTLIER') {
            if (configName == "minSampleSize" && configValue < 35) {
                throw getConfigErrorMsg(configLabel, "35");
            }
            if (configName == "minTotalDurationMinutes" && configValue < 120) {
                throw getConfigErrorMsg(configLabel, "120");
            }
            if ((configName == "minSlowOccurrences" || configName == "minNormalOccurrences") && configValue < 20) {
                throw getConfigErrorMsg(configLabel, "20");
            }
            if (configName == "minGroupDistance" && configValue < 5) {
                throw getConfigErrorMsg(configLabel, "120");
            }
        }

        var ratioLimit = 1000; //for minRatio and maxRatio
        if (type == "EXTRA_STEP" && (configName == "minRatio" || configName == "maxRatio") && configValue > ratioLimit) {
            throw gs.getMessage("Configuration value for {0} cannot be more than {1}", [configName, ratioLimit]);
        }

        var maxFindingLimit = gs.getProperty("promin.limit.max_automated_finding", 25);
        if (configName == "maxFindings" && configValue > maxFindingLimit) {
            throw gs.getMessage("Configuration value for {0} cannot be more than {1}", ["maxFindings", maxFindingLimit]);
        }
    } catch (e) {
        gs.addErrorMessage(e);
        current.setAbortAction(true);
    }

    function getConfigErrorMsg(name, value) {
        return gs.getMessage("Configuration value for {0} cannot be less than {1}", [name, value]);
    }

})(current, previous);
