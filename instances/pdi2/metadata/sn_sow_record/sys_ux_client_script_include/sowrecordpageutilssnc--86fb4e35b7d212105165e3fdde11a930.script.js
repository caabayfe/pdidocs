function include({ imports }) {

    class SOWRecordPageUtilsSNC {
        /**
             * Returns Metrics to track
             * @param {object} api
             * @return object
             */
        static getMetricsToTrack(api) {
            const metricsToTrack = [];
            let table = api.context.props.table;
            let fields = api.data.record.form.fields;
            switch (table) {
                case 'incident':
                    if (fields.state.value != fields.state.originalValue
                        && fields.state.value == 6) {
                        let appseePayload = {
                            event: "State Updated to Resolved",
                            value: {
                                "table": table
                            }
                        };
                        metricsToTrack.push(appseePayload);
                    }
                    break;
            }
            return metricsToTrack;
        }
    }
    return SOWRecordPageUtilsSNC;
}
