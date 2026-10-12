const UXAAppAnalysisService = Class.create();
UXAAppAnalysisService.prototype = {
    initialize: function(uxaDTO) {
        this.uxaUtils = new UXAUtils();
        this.uxaBaseService = new UXABaseService(uxaDTO);
        this.logger = QueryServiceApiLogger.getLogger('UXAAppAnalysisService');
    },

    fetchFunnelRecords: function(params) {
        const columns = UXAConstants.REQUIRED_COLUMNS.FUNNEL;
        this.uxaUtils.addToQueryParams(params, {
            columns: columns,
            'sortByColumn': UXAConstants.NAME,
            table: UXAConstants.TABLE.FUNNEL,
            orderBy: UXAConstants.PINNED,
            queryColumn: UXAConstants.APPLICATION_ID,
        });
        this.uxaUtils.constructParams(params);
        return this.__getGildeRecordData(params);
    },

    fetchCohortRecords: function(params) {
        const columns = UXAConstants.REQUIRED_COLUMNS.COHORT;
        this.uxaUtils.addToQueryParams(params, {
            columns: columns,
            'sortByColumn': UXAConstants.NAME,
            table: UXAConstants.TABLE.COHORT,
            orderBy: UXAConstants.PINNED,
            queryColumn: UXAConstants.APPLICATION_ID,
        });
        this.uxaUtils.constructParams(params);
        const cohorts = this.__getGildeRecordData(params);
        let pages = new Set();
        cohorts.forEach(cohort => {
            const steps = JSON.parse(cohort.steps);
            steps.forEach(step => {
                step.Alternatives.forEach(alternative => {
                    if (alternative.StepType === UXAConstants.PAGE_VISIT_STEP_TYPE) {
                        pages.add(alternative.Value);
                    }
                });
            });
            cohort.steps = steps;
        });

        const channel = UXAConstants.CHANNEL_ENUM[params.channel.toUpperCase()].ID;
        const pageNames = this.uxaUtils.getPageDisplayNames(params.applicationId, channel, Array.from(pages));

        return cohorts.map(cohort => {
            const steps = cohort.steps;
            steps.forEach(step => {
                step.Alternatives.forEach(alternative => {
                    if (alternative.StepType === UXAConstants.PAGE_VISIT_STEP_TYPE) {
                        const value = alternative.Value;
                        alternative.Value = pageNames[value] || value;
                    }
                });
            });

            return {
                ...cohort,
                steps: JSON.stringify(steps)
            }
        });
    },

    updateFunnelRecord: function(params) {
        if (params.sys_id === '')
            return this.__createRecord(params, UXAConstants.TABLE.FUNNEL);
        else
            return this.__updateRecord(params, UXAConstants.TABLE.FUNNEL, UXAConstants.REQUIRED_COLUMNS.FUNNEL);
    },

    updateCohortRecord: function(params) {
        if (params.sys_id === '')
            return this.__createRecord(params, UXAConstants.TABLE.COHORT);
        else
            return this.__updateRecord(params, UXAConstants.TABLE.COHORT, UXAConstants.REQUIRED_COLUMNS.COHORT);
    },

    fetchSingleFunnelData: function(uxaDTO) {
        const funnelSysId = uxaDTO.getSysId();
        const funnellegacyId = uxaDTO.getLegacyId();
        const sysIdForRecordFetch = funnelSysId || funnellegacyId;
        const funnelParams = this.uxaUtils.fetchMetadata(sysIdForRecordFetch, UXAConstants.TABLE.FUNNEL, UXAConstants.REQUIRED_COLUMNS.SINGLE_FUNNEL);
        let steps = JSON.parse(funnelParams.steps);
        let result;
        if (this.uxaUtils.validateFunnelSteps(steps)) {
            steps = this.uxaUtils.validateFunnelFirstStep(steps, uxaDTO);
            uxaDTO.setFunnelSteps(steps);
            result = this.uxaBaseService.getFunnelData(uxaDTO);
        }
        return result;
    },

    fetchNavigationPathsData: function(uxaDTO) {
        let result = this.uxaBaseService.getNavigationPathsData(uxaDTO);

        //Get PageNames map as k=name and v=desc
        const nameLabels = this.uxaUtils.getPageKeyValueMapping(uxaDTO);

        result.forEach(path => {
            path.Nodes.forEach(node => {
                if (node.Name)
                    node.NodeTypeDesc = nameLabels[node.Name] || node.NodeTypeDesc || node.Name;
            });
        });
        return result;
    },

    fetchSingleCohortData: function(uxaDTO) {
        const cohortSysId = uxaDTO.getSysId();
        const cohortlegacyId = uxaDTO.getLegacyId();
        const sysIdForRecordFetch = cohortSysId || cohortlegacyId;
        const cohortParams = this.uxaUtils.fetchMetadata(sysIdForRecordFetch, UXAConstants.TABLE.COHORT, UXAConstants.REQUIRED_COLUMNS.SINGLE_COHORT);
        let steps = JSON.parse(cohortParams.steps);
        let result;
        if (this.uxaUtils.validateCohortSteps(steps)) {
            steps = this.uxaUtils.validateCohortFirstStep(steps, uxaDTO);
            uxaDTO.setCohortSteps(steps);
            result = this.uxaBaseService.getCohortData(uxaDTO);
        }
        return result;
    },

    __getGildeRecordData: function(params) {
        const result = [];
        // We don't need to GlideRecordSecure here, since all the users will be seeing the same data.
        // And there are already ACLs in place for the given tables
        const gr = new GlideRecord(params.table);
        gr.addQuery(UXAConstants.STATUS, UXAConstants.ACTIVE);
        if (params.orderBy) {
            const fieldName = params.orderBy; // Replace with your field name
            const fieldType = gr.getElement(fieldName).getED().getInternalType();
            if (fieldType === 'boolean')
                gr.orderByDesc(params.orderBy);
            else
                gr.orderBy(params.orderBy);
        }

        const sortOrder = params.sortBy;
        if (sortOrder === UXAConstants.SORT_ORDER_ASC)
            gr.orderBy(params.sortByColumn);
        else
            gr.orderByDesc(params.sortByColumn);

        if (params.searchKey) {
            const searchKey = params.searchKey;
            gr.addQuery(UXAConstants.NAME, UXAConstants.CONTAINS, searchKey).addOrCondition(UXAConstants.DESCRIPTION, UXAConstants.CONTAINS, searchKey);
        }
        if (params.queryColumn) {
            gr.addQuery(params.queryColumn, params[UXAConstants.UI_COLUMN_MAPPING[params.queryColumn]]);
        }
        gr.query();
        while (gr.next()) {
            const obj = {};
            params.columns.forEach(function(column) {
                const columnType = gr.getElement(column).getED().getInternalType();
                if (columnType === 'boolean')
                    obj[column] = global.JSUtil.getBooleanValue(gr, column);
                else if (columnType === 'glide_date_time' && ['sys_created_on', 'sys_updated_on'].includes(column))
                    obj[column] = gr.getDisplayValue(column);
                else
                    obj[column] = gr.getValue(column);
            });
            result.push(obj);
        }
        return result;
    },

    __createRecord: function(params, table, uniqueColumn = '') {
        if (uniqueColumn !== "") {
            const gr = new GlideRecord(table);
            gr.addQuery(uniqueColumn, params[uniqueColumn]);
            gr.query();
            if (gr.hasNext()) {
                this.logger.debug('Record already exists');
                return {
                    message: 'Record already exists'
                };
            }
        }
        this.uxaUtils.removeParams(params, [UXAConstants.SYS_ID]);
        const gr = new GlideRecord(table);
        gr.initialize();
        for (const key in params) {
            gr.setValue(key, params[key]);
        }
        const sysId = gr.insert();
        if (sysId) {
            gr.get(sysId);
            const sysCreatedBy = gr.sys_created_by;
            const sysCreatedOn = gr.getDisplayValue('sys_created_on');
            const legacyId = gr.legacy_id;
            return {
                message: "Record created successfully",
                sys_id: sysId,
                legacy_id: legacyId,
                sys_created_by: sysCreatedBy,
                sys_created_on: sysCreatedOn
            };
        } else {
            return {
                message: "Record creation failed"
            };
        }
    },

    __updateRecord: function(params, table, columns = []) {
        const sys_id = params.sys_id;
        this.uxaUtils.removeParams(params, [UXAConstants.SYS_ID]);
        const gr = new GlideRecord(table);
        gr.addQuery(UXAConstants.SYS_ID, sys_id);
        gr.query();
        if (gr.next()) {
            for (const key in params)
                gr.setValue(key, params[key]);
            gr.update();
            const obj = {};
            if (columns.length >= 1) {
                columns.forEach(function(column) {
                    const columnType = gr.getElement(column).getED().getInternalType();
                    if (columnType === 'boolean')
                        obj[column] = global.JSUtil.getBooleanValue(gr, column);
                    else if (columnType === 'glide_date_time' && ['sys_created_on', 'sys_updated_on'].includes(column))
                        obj[column] = gr.getDisplayValue(column);
                    else
                        obj[column] = gr.getValue(column);
                });
            }
            this.logger.debug('Record updated successfully');
            return {
                ...obj,
                message: "Record updated successfully",
            };
        } else
            this.logger.debug('Record not found');
        return {
            message: "Record not found"
        };
    },

    type: 'UXAAppAnalysisService'
};
