var UXAFunnelTransformer = Class.create();
UXAFunnelTransformer.prototype = {
    initialize: function() {
        this.uxaUtils = new UXAUtils();
    },
    transform: function(response, uxaDTO) {
        const funnelParams = this.uxaUtils.fetchMetadata(uxaDTO.getSysId(), UXAConstants.TABLE.FUNNEL, UXAConstants.REQUIRED_COLUMNS.SINGLE_FUNNEL);
        const resultRows = response.rows;
        const resultColumns = response.columns;
        const funnelCompletionAverageDuration = response.funnel_completion_average_duration;
        let usersCountIndex = -1;
        let averageDurationIndex = -1;
        //Find the index for UsersCount, AverageDurationStep
        resultColumns.forEach((column, index) => {
            if (column[0] === UXAConstants.USERS_COUNT) {
                usersCountIndex = index;
            } else if (column[0] === UXAConstants.AVERAGE_DURATION_STEP) {
                averageDurationIndex = index;
            }
        });

        let totalUsersEntered = resultRows[0][usersCountIndex];
        const resultRowsLength = resultRows.length;
        const totalUsersCompleted = resultRows[resultRowsLength - 1][usersCountIndex];
        const funnelSteps = JSON.parse(funnelParams.steps);
        const totalFunnelSteps = funnelSteps.length;
        const steps = [];
        funnelSteps[0].Alternatives.some(alternative => {
            if (!UXAConstants.VALID_FIRST_FUNNEL_STEP.includes(alternative.StepType)) {
                totalUsersEntered = resultRows[1][usersCountIndex];
                resultRows.shift();
                return true;
            }
        });
        this._updatePageNames(uxaDTO, funnelSteps);
        funnelSteps.forEach((stepData, index) => {
            let completedUsers, enteredUsersCount, overallCompletionRatio;

            if (index === 0) {
                completedUsers = resultRows[index][usersCountIndex];
                enteredUsersCount = resultRows[index][usersCountIndex];
            } else {
                completedUsers = resultRows[index][usersCountIndex];
                enteredUsersCount = resultRows[index - 1][usersCountIndex];
            }

            overallCompletionRatio = enteredUsersCount ? (completedUsers / enteredUsersCount) : 0;

            const step = {
                'StepNumber': stepData.StepNumber,
                'Alternatives': stepData.Alternatives.map(alternative => ({
                    'StepType': UXAConstants.FUNNEL_ENUM_UI_MAPPING[alternative.StepType],
                    'StepDescription': this.uxaUtils.formStepDescriptionForFunnels(alternative)
                })),
                'CompletedUsers': completedUsers,
                'EnteredUsersCount': enteredUsersCount,
                'OverallCompletionRatio': overallCompletionRatio
            };

            if (averageDurationIndex != -1) {
                step[UXAConstants.AVERAGE_DURATION_STEP] = resultRows[index][averageDurationIndex];
            }
            steps.push(step);
        });

        const funnelResult = {
            'Id': uxaDTO.getSysId(),
            'Name': funnelParams.name,
            'CreationDate': funnelParams.sys_created_on,
            'Status': funnelParams.status,
            'Steps': steps,
            'totalUsersEntered': totalUsersEntered,
            'totalUsersCompleted': totalUsersCompleted,
            'completionRate': (totalUsersCompleted / totalUsersEntered)
        };

        if (funnelCompletionAverageDuration && funnelCompletionAverageDuration >= 0)
            funnelResult['funnelCompletionAverageDuration'] = funnelCompletionAverageDuration;

        return funnelResult;
    },

    _updatePageNames: function(uxaDTO, steps) {
        const pages = new Set();
        steps.forEach(step => {
            step.Alternatives.forEach(alternative => {
                if (alternative.StepType === UXAConstants.PAGE_VISIT_STEP_TYPE) {
                    pages.add(alternative.Value);
                }
            });
        });
        const pageNames = this.uxaUtils.getPageDisplayNames(uxaDTO.getApplicationSysId(), uxaDTO.getChannel(), Array.from(pages));

        steps.forEach(step => {
            step.Alternatives.forEach(alternative => {
                if (alternative.StepType === UXAConstants.PAGE_VISIT_STEP_TYPE) {
                    const value = alternative.Value;
                    alternative.Value = pageNames[value] || value
                }
            });
        });
    },

    type: 'UXAFunnelTransformer'
};
