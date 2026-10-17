/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

const {
        idleTimeConfiguration: {
            fields,
            status,
            isIdleTimeConfigValid
        },
        processId,
        metricsMessages,
        projectPermissions: {
            promin_process_def,
            promin_activity_def
        },
        projectIdleTimeEnabled
    } = api.state;

    if (!promin_process_def?.canCreate) {
        if (!processId || !fields?.length > 0) {
            return {};
        }
        if (promin_activity_def.canCreate && status) {
            return {
                "href": "",
                "label": metricsMessages.outOfSync?.action,
                "type": "acknowledge",
                "operation": "review_process_configuration"
            };
        }
        return {};
    }

    if (status && !processId) {
        return {};
    }

    if (status) {
        return {
            "href": "",
            "label": metricsMessages.outOfSync?.action,
            "type": "acknowledge",
            "operation": "review_process_configuration"
        };
    }

    if (!processId) {
        return {
            "href": "\"\"",
            "label": metricsMessages.configMissing?.action,
            "type": "acknowledge",
            "operation": "create_process_config"
        };
    }

    if (!fields?.length > 0) {
        return {
            "href": "\"\"",
            "label": metricsMessages.metricsMissing?.action,
            "type": "acknowledge",
            "operation": "create_config_metrics"
        };
    }

    if (fields.length > 0 && !isIdleTimeConfigValid) {
      return {
            "href": "\"\"",
            "label": metricsMessages.metricsMissing?.action,
            "type": "acknowledge",
            "operation": "create_config_metrics"
        };
    }
}
