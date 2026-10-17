var AnomalyMBDataPointsHandler = Class.create();
AnomalyMBDataPointsHandler.prototype = {
    initialize: function() {

        this.TimeRangeForAlertAnomalyMetrics = "evt_mgmt.TimeRangeForAlertAnomalyMetrics";
        this.timeRange = gs.getProperty(this.TimeRangeForAlertAnomalyMetrics, 1);
        this.timeRangeInSec = this.timeRange * 3600;
        this.logAnalyticsStr = "Log Analytics";
        //this.anomalyMetricData = new  AnomalyMetricData();
    },

    process: function(alertSysId) {
        var alertGr = new GlideRecord("em_alert");
        alertGr.addQuery("sys_id", alertSysId);
        alertGr.query();
        var result = {};
        if (alertGr.next()) {
            var additionalInfo = JSON.parse(alertGr.getValue("additional_info"));
            if (!additionalInfo) {
                gs.error("AnomalyMBDataPointsHandler: Failed parsing additinal info in alert id %0, returning empty state", alertSysId);
                return {
                    metrics: []
                }; //empty state
            }
            var creationTime = alertGr.getValue('initial_event_time');
            if (!creationTime) {
                gs.error("AnomalyMBDataPointsHandler: Event creation time in alert id %0 is empty, returning empty state", alertSysId);

                return {
                    metrics: []
                };
            }
            var start = new GlideDateTime(creationTime);
            start.subtract(this.timeRangeInSec * 1000);

            var end = new GlideDateTime(creationTime);
            end.addSeconds(this.timeRangeInSec);

            //Distinguish between Log Anlytics alerts, and other OI anomalies according 
            if (this.isValidTag(additionalInfo, 'sn_source') && this.logAnalyticsStr == additionalInfo.sn_source) { //Log Analytics alert
                if (!this.isValidTag(additionalInfo, 'sn_detection_type') ||
                    !this.isValidTag(additionalInfo, 'sn_metric_source') ||
                    !this.isValidTag(additionalInfo, 'sn_metric_dimension')) {
                    gs.error("AnomalyMBDataPointsHandler: Missing info in the additional info in alert id %0 is empty, returning empty state", alertSysId);

                    return {
                        metrics: []
                    }; //empty state?
                }

                var detectionType = additionalInfo.sn_detection_type;
                var detectionTypeData = this.getDetectionTypeData(detectionType, additionalInfo);
                var source = additionalInfo.sn_metric_source;
                var dimensionFull = additionalInfo.sn_metric_dimension;

                var dimensionParts = dimensionFull.split('|');
                var dimension = dimensionParts[1];
                if (detectionType.hasMetricData == 0)
                    var currentPoinst = [];
                else
                    var currentPoints = this.getPointsLA(source, dimension, start, end);

                //get expected metric points

                var compareTime = detectionTypeData.compare;
                var expectedStart = new GlideDateTime(start);
                expectedStart.addSeconds(compareTime * -1);
                var expectedEnd = new GlideDateTime(end);
                expectedEnd.addSeconds(compareTime * -1);

                var expectedPoints;
                if (detectionTypeData.compare != 0)
                    expectedPoints = this.getPointsLA(source, dimension, expectedStart, expectedEnd);


                //build Json to return to UI 

                var countValue = additionalInfo.sn_anomaly_current;
                var expectedValue = detectionTypeData.expectedValue;
                var expectedType = detectionTypeData.expectedType;
                var countType = detectionTypeData.countType;


                result = {

                    tooltip: detectionTypeData.toolTip,

                    count: {
                        value: countValue,
                        type: 'Events per minute'
                    },

                    expected: {
                        value: expectedValue,
                        type: expectedType
                    },
                    metrics: [{
                            type: "RAW",
                            data: currentPoints
                        },
                        {
                            type: "EXPECTED",
                            data: expectedPoints
                        }
                    ]
                };

                gs.print(JSON.stringify(result));

            } else //OI
                result = {
                    metric: "here come the OI data"
                };
            //      result = anomalyMetricData.getAllData(alertSysId,start,end);
        }
        return result;

    },

    getDetectionTypeData: function(detectionType, additionalInfo) {

        var detectionTypeData = {};

        detectionTypeData.countType = 'Event per minute';

        switch (detectionType) {
            case ('SIGNAL_ALIVE'):
                detectionTypeData.compare = 0;
                detectionTypeData.toolTip = "This low-volume log appears more frequently";
                detectionTypeData.expectedType = "Typically inactive";
                detectionTypeData.expectedValue = null;
                break;

            case ('ANOMALY_BASELINE_REFERENCE_INCREASE'):
                detectionTypeData.compare = 168 * 3600;
                detectionTypeData.toolTip = "Anomalous behavior detected in this hour as compared to the same hour last week";
                detectionTypeData.expectedValue = additionalInfo.sn_anomaly_expected + " Events " + additionalInfo.sn_anomaly_change_precentage + " increase";
                detectionTypeData.expectedType = "Same hour last week:";
                break;

            case ('ANOMALY_BASELINE_REFERENCE_DECREASE'):
                detectionTypeData.compare = 168 * 3600;
                detectionTypeData.toolTip = "Anomalous behavior detected in this hour as compared to the same hour last week";
                detectionTypeData.expectedValue = additionalInfo.sn_anomaly_expected + " Events " + additionalInfo.sn_anomaly_change_precentage + " decrease";
                detectionTypeData.expectedType = "Same hour last week:";
                break;

            case ('ANOMALY_STEEP_INCREASE'):
            case ('ANOMALY_ABOVE_AVERAGE'):
                detectionTypeData.compare = 24 * 3600;
                detectionTypeData.toolTip = "Anomalous behavior detected as compared to past behavior";
                detectionTypeData.expectedType = "Same hour 1 day before";
                detectionTypeData.expectedValue = additionalInfo.sn_anomaly_expected + " Events " + additionalInfo.sn_anomaly_change_precentage + " increase";
                break;

            case ('ANOMALY_STEEP_DECREASE'):
            case ('ANOMALY_BELOW_AVERAGE'):
                detectionTypeData.compare = 24 * 3600;
                detectionTypeData.toolTip = "Anomalous behavior detected as compared to past behavior";
                detectionTypeData.expectedType = "Same hour 1 day before";
                detectionTypeData.expectedValue = additionalInfo.sn_anomaly_expected + " Events " + additionalInfo.sn_anomaly_change_precentage + " decrease";
                break;

            case ('TIMELESS_TREND_INCREASE'):
                detectionTypeData.compare = additionalInfo.sn_anomaly_change_precentage;
                detectionTypeData.toolTip = "Anomolus drop detected for this metric, when compared to past behavior";
                detectionTypeData.expectedValue = additionalInfo.sn_anomaly_current + " " + additionalInfo.sn_anomaly_change_precentage + " increase";
                detectionTypeData.expectedType = "Avg. of last " + additionalInfo.sn_points_in_timeless_trend + " samples";
                break;

            case ('TIMELESS_TREND_DECREASE'):
                detectionTypeData.compare = additionalInfo.sn_anomaly_change_precentage;
                detectionTypeData.toolTip = "Anomolus drop detected for this metric, when compared to past behavior";
                detectionTypeData.expectedValue = additionalInfo.sn_anomaly_current + " " + additionalInfo.sn_anomaly_change_precentage + " decrease";
                detectionTypeData.expectedType = "Avg. of last " + additionalInfo.sn_points_in_timeless_trend + " samples";
                break;

            case ('NEW_SIGNAL'):
                detectionTypeData.compare = 0; // no metricpoints to compare 
                detectionTypeData.toolTip = "First appearance of this pattern in " + additionalInfo.sn_component;
                detectionTypeData.expectedType = "New behaviour";
                detectionTypeData.expectedValue = "No data to display at the moment";
                break;

            case ('SIGNAL_DEAD'):
                detectionTypeData.compare = 0; // no metricpoints to compare 
                detectionTypeData.toolTip = "No data is streaming from " + additionalInfo.sn_component;
                detectionTypeData.expectedType = "Signal dead";
                detectionTypeData.expectedValue = "Data stopped streaming";
                break;

            case ("CUSTOM"):
				detectionTypeData.countType= "Log Entries in the course of " + additionalInfo.sn_custom_number +" "+ additionalInfo.sn_custom_time;
                detectionTypeData.compare = 0; // no metricpoints to compare 
                detectionTypeData.toolTip = "Manually defined threshold for this metric has been crossed";
                detectionTypeData.expectedType = "Defined threshold";
                detectionTypeData.expectedValue = additionalInfo.sn_custom_threshold +" <=> "+ additionalInfo.sn_anomaly_current;
			break;
            default:
                detectionTypeData.compare = 0; // no metricpoints to compare 
                detectionTypeData.toolTip = "Unrecognized detection type";
                detectionTypeData.expectedType = null;
                detectionTypeData.expectedValue = "Unrecognized detection type";
                break;
        }
        return detectionTypeData;
    },

    // check if the JSON tag/key is valid
    isValidTag: function(element, tag) {
        var val = element.hasOwnProperty(tag);
        return val;
    },


    getPointsLA: function(subject, dimension, start, end) {
        var gr = new GlideRecord("sn_occ_metric");
        gr.addQuery('name', subject);
        gr.query();
        if (gr.next()) {

            var selector = new sn_clotho.DataSelector(gr)
                .addMetric(dimension).label(dimension);

            var result = {};
            var data = new sn_clotho.Client().transform(selector, start, new GlideDateTime());
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    result["start_time"] = data[key].getStart() + '';
                    result["end_time"] = data[key].getEnd() + '';
                    result["points"] = (data[key].getValues());
                }
                gs.error("start time: " + result["start_time"] + " end time: " + result["end_time"]);
            }
            var timeStamp = new GlideDateTime(start);
            var points = result["points"];
            var parsedResult = [];
            for (var k in points) {
                if (timeStamp < end) {
                    parsedResult.push({
                        x: String(timeStamp),
                        y: JSON.stringify(points[k])
                    });
                    timeStamp.addSeconds(60);
                }
            }

            return parsedResult;
        }
    },


    type: 'AnomalyMBDataPointsHandler'
};
