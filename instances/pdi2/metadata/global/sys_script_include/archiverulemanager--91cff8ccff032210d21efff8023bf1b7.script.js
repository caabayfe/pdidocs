var ArchiveRuleManager = Class.create();
ArchiveRuleManager.prototype = Object.extendsObject(DMRuleConstants, {
    _LOGGER: undefined,
    _notArchivedTableList: undefined,
    _destroyRuleManager: undefined,
    _dmcUtils: undefined,

    initialize: function() {
        _notArchivedTableList = new NotArchivedTableList();
        _destroyRuleManager = new ArchiveDestroyRuleManager();
        _LOGGER = new GSLog("", this.DATA_MANAGEMENT_CONSOLE);
        _dmcUtils = new DMCUtils();
    },

    createOrUpdateRule: function(rule) {
        const gr = new GlideRecord(this.TABLES.SYS_ARCHIVE);
        const isUpdate = JSUtil.notNil(rule.sys_id) && gr.get(rule.sys_id);
        if (!isUpdate) {
            gr.initialize();
        }

        const {
            active,
            auto_rearchive,
            days_auto_rearchive,
            hours_auto_rearchive,
            minutes_auto_rearchive,
            seconds_auto_rearchive,
            condition,
            description,
            name,
            related_records,
            retain_references,
            table,
            enable_data_destroy,
            destroy_rule,
            activate_destroy,
            days_destroy_duration,
            hours_destroy_duration,
            minutes_destroy_duration,
            seconds_destroy_duration,
            destroy_related,
            destroy_record_estimate,
            destroy_estimate_date
        } = rule;

        let durationResponse = this.getDuration(days_auto_rearchive, hours_auto_rearchive, minutes_auto_rearchive, seconds_auto_rearchive);
        if (!durationResponse.status) {
            return this._buildErrorResult(rule.sys_id, this.ERROR_CODES.REARCHIVE_DURATION_ERROR, [durationResponse.message]);
        }

        gr.setValue("active", active);
        gr.setValue("auto_rearchive", auto_rearchive);
        gr.setValue("auto_rearchive_duration", durationResponse.duration);
        gr.setValue("condition", condition);
        gr.setValue("description", description);
        gr.setValue("name", name);
        gr.setValue("retain_references", retain_references);
        gr.setValue("table", table);
        var destroyResponse = {};
        if (enable_data_destroy) {
            const archiveRuleSysId = rule.sys_id;
            if (archiveRuleSysId) {
                destroyResponse = _destroyRuleManager.createOrUpdateDestroyRule(rule);
                const destroyRuleSysId = destroyResponse.sysID;
                if (destroyRuleSysId) {
                    gr.setValue("destroy_rule", destroyRuleSysId);
                }
            }
        } else {
            gr.setValue("destroy_rule", null);
            if (destroy_rule) {
                destroyResponse = _destroyRuleManager.deleteDestroyRule(destroy_rule);
            }
        }

        // Save Rule
        const sysID = isUpdate ? gr.update() : gr.insert();

        const result = this._buildResult(gr, sysID, related_records, destroyResponse);
        return result;
    },

    createArchiveRelatedRule: function(related_record) {
        var {
            action,
            reference,
            reference_rule,
            sys_id,
            archive_sys_ID
        } = related_record;
        if (!(action && reference && reference.value) || sys_id) return;
        var [table, element, relationship] = reference.value.split('.');

        var archiveRelatedGR = new GlideRecord(this.TABLES.SYS_ARCHIVE_RELATED);
        archiveRelatedGR.setValue("action", action);
        archiveRelatedGR.setValue("archive_map", archive_sys_ID);
        archiveRelatedGR.setValue("reference", reference.value);
        archiveRelatedGR.setValue("table", table);
        archiveRelatedGR.setValue("element", element);
        if (reference_rule && reference_rule.value) archiveRelatedGR.setValue("table_archive_rule", reference_rule.value);
        archiveRelatedGR.insert();

        var errorMessages = gs.getErrorMessages();
        if (errorMessages.size() > 0) {
            return this._buildErrorResult("", this.ERROR_CODES.INVALID_REFERENCE_TABLE, errorMessages);
        }
        related_record.sys_id = archiveRelatedGR.getUniqueValue();
        related_record.status = this.STATUS.SUCCESS;
        return related_record;
    },

    deleteArchiveRelatedRule: function(sys_id) {
        if (!sys_id) return;
        var archiveRelatedGR = new GlideRecord(this.TABLES.SYS_ARCHIVE_RELATED);
        if (archiveRelatedGR.get(sys_id)) {
            archiveRelatedGR.deleteRecord();
            return {
                sysID: sys_id,
                status: this.STATUS.SUCCESS,
            };
        } else {
            return this._buildErrorResult(sys_id, this.ERROR_CODES.ARCHIVE_RELATED_NOT_FOUND, ["Archive related rule not found for sysID: " + sys_id]);
        }
    },

    isArchiveEligible: function(tableName) {
        if (tableName.startsWith('ar_') || tableName.startsWith('ts_')) { //exclude archive table and text search table
            return false;
        } else {
            var td = GlideTableDescriptor.get(tableName);
            if (td.getED().getBooleanAttribute('no_archive')) //exclude table with no_archive=true
                return false;
        }
        return _notArchivedTableList.process().includes(tableName);
    },

    getRule: function(sysID) {
        const gr = new GlideRecord(this.TABLES.SYS_ARCHIVE);
        if (gr.get(sysID)) {
            const estimateDate = gr.getValue("estimate_date") ? new GlideDateTime(gr.getValue("estimate_date")).getDisplayValue() : "";
            const archiveRuleData = {
                "active": gr.getValue("active") == 1 ? true : false,
                "auto_rearchive": gr.getValue("auto_rearchive") == 1 ? true : false,
                "condition": gr.getValue("condition"),
                "description": gr.getValue("description"),
                "destroy_rule": gr.getValue("destroy_rule"),
                "name": gr.getValue("name"),
                "retain_references": gr.getValue("retain_references") == 1 ? true : false,
                "sys_id": sysID,
                "table": gr.getValue("table"),
                "related_records": this.getArchiveRelatedRecords(sysID),
                "estimate_date": estimateDate,
                "record_estimate": gr.getValue("record_estimate"),
                "can_delete": gr.canDelete(),
                ...this._convertAutoRearchiveDurationToYDH(gr.getValue("auto_rearchive_duration"))
            };

            const destroyRuleData = _destroyRuleManager.getDestroyRule(gr.getValue("destroy_rule"));
            return {
                ...archiveRuleData,
                ...destroyRuleData
            };
        }
    },

    activateRule: function(sysID, isActive) {
        const gr = new GlideRecord(this.TABLES.SYS_ARCHIVE);
        if (gr.get(sysID)) {
            gr.setValue("active", isActive);
            gr.update();
        }
        const infoMessages = gs.getInfoMessages();
        const errorMessages = gs.getErrorMessages();
        const abortErrorMessage = gr.getLastErrorMessage();

        if (errorMessages.size() > 0) {
            return {
                status: this.STATUS.ERROR,
                messages: errorMessages.get(0)
            };
        }
        if (abortErrorMessage && abortErrorMessage.includes("sys_archive") && abortErrorMessage.includes("aborted")) {
            return {
                status: this.STATUS.ERROR,
                messages: infoMessages.get(0)
            };
        }
        if (infoMessages.size() > 0) {
            return {
                status: this.STATUS.SUCCESS,
                messages: infoMessages.get(0)
            };
        }
        if (!isActive) {
            return {
                status: this.STATUS.SUCCESS
            };
        }
    },

    _convertAutoRearchiveDurationToYDH: function(duration) {
        let days, hours, minutes, seconds;
        if (duration) {
            const ageInSeconds = new GlideDateTime(duration).getNumericValue() / 1000;
            ({ days, hours, minutes, seconds } = _dmcUtils.transformSecondsToYDH(ageInSeconds));
        }
        return {
            "days_auto_rearchive": days,
            "hours_auto_rearchive": hours,
            "minutes_auto_rearchive": minutes,
            "seconds_auto_rearchive": seconds
        };
    },

    getArchiveRelatedRecords: function(sysID) {
        var archiveRelatedGR = new GlideRecord(this.TABLES.SYS_ARCHIVE_RELATED);
        archiveRelatedGR.addQuery("archive_map", sysID);
        archiveRelatedGR.query();
        var related_records = [];
        while (archiveRelatedGR.next()) {
            var reference = archiveRelatedGR.getValue("reference");
            var reference_rule = archiveRelatedGR.getValue("table_archive_rule");

            related_records.push({
                action: archiveRelatedGR.getValue("action"),
                reference: {
                    value: reference,
                    item: {
                        id: reference,
                        label: this.getReferenceLabel(reference)
                    }
                },
                reference_rule: {
                    value: reference_rule,
                    item: {
                        id: reference_rule,
                        label: this.getReferenceRuleLabel(reference_rule)
                    }
                },
                archive_sys_ID: sysID,
                sys_id: archiveRelatedGR.getUniqueValue()
            });
        }
        return related_records;
    },

    getReferenceLabel: function(reference) {
        var table = reference.split(".")[0];
        var element = reference.split(".")[1];
        var tableLabel = GlideTableDescriptor.get(table).getLabel() || table;
        var tableGR = new GlideRecord(table);
        var elementLabel = tableGR.getElement(element).getED().getLabel() || element;
        return elementLabel + " " + gs.getMessage("in") + " " + tableLabel;
    },

    getReferenceRuleLabel: function(sysID) {
        var archiveGR = new GlideRecord(this.TABLES.SYS_ARCHIVE);
        var ruleLabel = sysID;
        if (archiveGR.get(sysID)) {
            ruleLabel = archiveGR.getValue("name");
        }
        return ruleLabel;
    },

    hasRetainReferencesEnabled: function(tableName) {
        // Check if archive table already exist for this table and has reference type
        const dict = new GlideRecord(this.TABLES.SYS_DICTIONARY);
        dict.addQuery(this.FIELDS.NAME, this.PREFIX.ARCHIVE + tableName);
        dict.addQuery(this.FIELDS.INTERNAL_TYPE, this.VALUES.REFERENCE);
        dict.query();
        return dict.hasNext();
    },

    calculateArchiveEstimate(archiveSysId, condition) {
        let recordEstimate = "";
        let estimateDate = "";

        const sysArchive = new GlideRecord(this.TABLES.SYS_ARCHIVE);
        if (sysArchive.get(archiveSysId)) {
            sysArchive.setValue(this.ARCHIVE_COLUMNS.CONDITION, condition);
            sysArchive.update();

            const archiveStatus = new GlideArchiveStatus(archiveSysId);
            archiveStatus.setEstimate(sysArchive);
            sysArchive.update();

            recordEstimate = sysArchive.getValue(this.ARCHIVE_COLUMNS.RECORD_ESTIMATE);
            estimateDate = new GlideDateTime(sysArchive.getValue(this.ARCHIVE_COLUMNS.ESTIMATE_DATE)).getDisplayValue();
        }
        return {
            recordEstimate,
            estimateDate
        };
    },

    _buildResult: function(gr, sysID, related_records, destroyResponse) {
        const errMsgs = gs.getErrorMessages();
        const infoMsgs = gs.getInfoMessages();
        if (!sysID) {
            this._LOGGER.logErr(errMsgs);
            return this._buildErrorResult(sysID, "", errMsgs);
        }
        // Some BRs are generating error messages without invoking setAbortAction
        return {
            sysID: sysID,
            status: this.STATUS.SUCCESS,
            related_records: related_records,
            messages: errMsgs,
            infoMsgs: infoMsgs,
            destroy_rule: destroyResponse
        };
    },

    _buildErrorResult(sysId, errorCode, messages) {
        return {
            sysID: sysId,
            status: this.STATUS.ERROR,
            errorCode: errorCode,
            messages: messages
        };
    },

    getDuration(days, hours, minutes, seconds) {
        const error = gs.getMessage("Please enter a valid value for duration");
        let daysNum = 0,
            hoursNum = 0,
            minutesNum = 0,
            secondsNum = 0;

        // Validation checks
        if ((this._isParsableInteger(hours) && (hours < 0 || hours > 23)) ||
            (this._isParsableInteger(days) && (days < 0 || days > 24854)) ||
            (this._isParsableInteger(minutes) && (minutes < 0 || minutes > 59)) ||
            (this._isParsableInteger(seconds) && (seconds < 0 || seconds > 59))) {
            return {
                status: false,
                message: error
            };
        }

        // Hours
        if (this._isParsableInteger(hours)) {
            hoursNum = Number(hours);
        }

        // Days
        if (this._isParsableInteger(days)) {
            daysNum = Number(days);
        }

        // Minutes
        if (this._isParsableInteger(minutes)) {
            minutesNum = Number(minutes);
        }

        // Seconds
        if (this._isParsableInteger(seconds)) {
            secondsNum = Number(seconds);
        }

        if (!daysNum && !hoursNum && !minutesNum && !secondsNum)
            return {
                status: true,
                duration: undefined
            };

        duration = new GlideDuration(0);
        const totalSecs = _dmcUtils.calculateAgeInSeconds(daysNum, hoursNum, minutesNum, secondsNum);
        duration.addSeconds(totalSecs);

        return {
            status: true,
            duration
        };
    },

    _isParsableInteger: function(value) {
        if (value === undefined || value === null)
            return false;
        const str = String(value).trim();
        if (str === '')
            return false;
        const num = Number(str);
        return !isNaN(num) && Number.isInteger(num);
    },

    deleteRule: function(sysId) {
        let status = _dmcUtils.deleteRecord(this.TABLES.SYS_ARCHIVE, sysId);
        return {
            status: status ? this.STATUS.SUCCESS : this.STATUS.ERROR,
			message: gs.getMessage("The rule has been deleted successfully.")
        };
    },

    type: 'ArchiveRuleManager'
});
