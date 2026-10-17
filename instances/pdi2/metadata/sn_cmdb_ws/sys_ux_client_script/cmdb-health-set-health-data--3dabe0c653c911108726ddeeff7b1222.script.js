/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        hasCmdbAdminOrAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();

    const {
        NowDateTime
    } = imports["sn_uxf.core_libraries"]();

    const COMPLETENESS = "Completeness";
    const COMPLIANCE = "Compliance";
    const CORRECTNESS = "Correctness";
    const COMPLETE = "complete";
    const NOT_RUN = "not_run";
    let healthData = {
        [COMPLETENESS.toLowerCase()]: {
            label: COMPLETENESS
        },
        [COMPLIANCE.toLowerCase()]: {
            label: COMPLIANCE
        },
        [CORRECTNESS.toLowerCase()]: {
            label: CORRECTNESS
        }
    };

    let output = api.data.cmdb_health_compute_health_score.output;
    if (!output) {
        api.setState('healthData', healthData);
        return;
    }

    let result = output;
    let lastUpdatedValue = '';
    let updateData = {
        value: '',
        string: ''
    };

    let jobsNotRunCount = 0;
    const dateFormat = (api.context.session.user.dateFormat || 'YYYY-MM-DD').toUpperCase();
    const timeFormat = (api.context.session.user.timeFormat || 'HH:mm:ss').replace("a", "A");
    const dateTimeFormat = `${dateFormat} ${timeFormat}`;

    for (let record in result) {
        let {
            metric,
            friendly_name,
            status,
            score,
            default_score_label,
            updated,
            metric_aria_label,
            last_update_label,
            has_no_results
        } = result[record];
        if (healthData.hasOwnProperty(metric.toLowerCase())) {
            metric = metric.toLowerCase();
            healthData[metric].label = friendly_name;
            healthData[metric].score = default_score_label;
            if (status.toLowerCase() === NOT_RUN) {
                jobsNotRunCount++;
            } else if (status.toLowerCase() === COMPLETE && !has_no_results) {
                healthData[metric].score = (100 - Number(score)) + '%';
                healthData[metric].ariaLabel = metric_aria_label;
                if(updated){
                    let updateDate = new NowDateTime(updated, dateTimeFormat);
                    if (updateDate.valueOf() > lastUpdatedValue) {
                        updateData = {
                            value: updateDate.valueOf(),
                            string: last_update_label
                        };
                        lastUpdatedValue = updateDate.valueOf();
                    }
                }
            }
        }
    }
    api.setState('cmdbHealthLastUpdate', updateData);

    let userHasCmdbAdminOrAdminOrMaint = hasCmdbAdminOrAdminOrMaint(api.context.session.user.roles);
    let healthSectionVisibility = JSON.parse(JSON.stringify(api.state.healthSectionVisibility));
    if (jobsNotRunCount == 3) {
         if (userHasCmdbAdminOrAdminOrMaint) {
            healthSectionVisibility.hideEmptyStateAdmin = false;
         } else {
            healthSectionVisibility.hideEmptyStateNonAdmin = false;
         }
    } else {
        healthSectionVisibility.hideScores = false;
    }
    api.setState('healthSectionVisibility', healthSectionVisibility);
    api.setState('healthData', healthData);
}
