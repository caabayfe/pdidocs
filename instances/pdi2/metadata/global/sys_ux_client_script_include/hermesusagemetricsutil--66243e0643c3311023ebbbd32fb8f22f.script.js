function include({ imports }) {
  return {
    getAggregateScoreGraphJson: _getAggregateScoreTemplate,
    getTimeSeriesLineGraphData: _getTimeSeriesLineGraphData,
    getTopicFetchQuery: _getTopicFetchQuery,
    getAggregateMbInAndOut: _getAggregateMbInAndOut,
    getTopicUsageBarGraphData: _getTopicUsageBarGraphData,
    getTopicUsageTableData: _getTopicUsageTableData,
    getTopicCountForUsageTableData: _getTopicCountForUsageTableData,
    getAppData: _getAppData,
    getServiceIdData: _getServiceIdData,
    getTopicData: _getTopicData,
    DEFAULT_MONTHS_AGO: _getDefaultMonthsAgo(),
    getHermesUsageQuery: _getHermesUsageQuery,
    getNotificationTemplate: _getNotificationTemplate,
    getDateDiffInDays: _getDateDiffInDays
  };

  /**
   * Get score graph template
   *
   * @param {aggValue} args
   * @returns JSON - score graph template with aggregate value
   */
  function _getAggregateScoreTemplate(args) {
    let { aggValue } = args;
    let scoreTemplate = [
      {
        data: [
          {
            change: "0",
            changePercent: "0",
            value: "", // to be updated for score graph
          },
        ],
        metadata: {
          format: {
            unitFormat: "{0}",
            frequency: "daily",
            precision: 4,
          },
        },
      },
    ];
    scoreTemplate[0]["data"][0]["value"] = aggValue;
    return scoreTemplate;
  }

  /**
   * Get line graph template
   *
   * @param {timeSeriesData} args
   * @returns JSON - line graph template with time series values
   */
  function _getTimeSeriesLineGraphData(args) {
    let { timeSeriesData, userSessionTimeZoneOffset} = args;
    let filteredData = timeSeriesData;
    let lineGraphDataTemplate = [
      {
        data: [], // to be filled for 1st line graph
        metadata: {
          dataSourceLabel: "BYTES IN (MB)",
          series: [
            {
              label: "BYTES IN (MB)",
              id: "value",
              type: "value",
            },
          ],
          format: {
            unitFormat: "{0}",
            frequency: "daily",
            precision: 4,
          },
        },
      },
      {
        data: [], // to be filled for 2nd line graph
        metadata: {
          dataSourceLabel: "BYTES OUT (MB)",
          series: [
            {
              label: "BYTES OUT (MB)",
              id: "value",
              type: "value",
            },
          ],
          format: {
            unitFormat: "{0}",
            frequency: "daily",
            precision: 4,
          },
        },
      },
    ];
    let gropedMetricData = Object.groupBy(
      timeSeriesData, ({ metric_name }) => metric_name.value
    );
    let graphLineIndex = 0;
    let metricNames = _getMetricList();
    for (let metric of metricNames) {
      for (let metricData of gropedMetricData[metric] ?? []) {
        lineGraphDataTemplate[graphLineIndex]["data"].push({
          timestamp: _convertGlideDateTimeToUnixTimeStamp({
            utcValue: metricData["sys_created_on"].value,
            userSessionTimeZoneOffset,
          }),
          value: metricData["hour_total_mb_value"].value,
        });
      }
      graphLineIndex++;      
    }
    return lineGraphDataTemplate;
  }

  /**
   * List of metrics used
   *
   * @param
   * @returns Array - metrics used
   */
  function _getMetricList() {
    return ["BytesInPerSec","BytesOutPerSec"];
  }

  /**
   * List of source types
   *
   * @param
   * @returns Array - source types used
   */
  function _getSourceTypes() {
    return ["ALL", "CUSTOMER", "INSTANCE", "OTHER"];
  }
  /**
   * Convert glideDateTime utc value to unix time stamp, adjusted to user session timezone
   *
   * @param {dateStr, userSessionTimeZoneOffset} glideDateTime string, userSessionTimeZoneOffset long
   * @returns String - unix time stamp
   */
  function _convertGlideDateTimeToUnixTimeStamp(args) {
    // Date format YYYY-MM-DDTHH:mm:ss.sssZ
    let { utcValue, userSessionTimeZoneOffset } = args;
    let dateTime = utcValue.split(" ");
    let utcString = `${dateTime[0]}T${dateTime[1]}Z`;
    let dateUtc = new Date(utcString);
    let timeZoneAdjustedTimeStamp = dateUtc.getTime() + userSessionTimeZoneOffset;
    return timeZoneAdjustedTimeStamp + "";
  }

  /**
   * Build topic encoded query from selected options
   *
   * @param {selectedServiceId} serivce Id
   * @param {selectedAppId} app Id
   * @returns String - encodedQuery
   */
  function _getTopicFetchQuery(selectedServiceId, selectedAppId, selectedSourceId) {
    let topicFetchArgs = {
      selectedApp: {
        item: {
          id: selectedAppId,
        },
      },
      selectedService: {
        item: {
          id: selectedServiceId,
        },
      },
      selectedSourceType: {
        item: {
          id: selectedSourceId,
        },
      },
    };
    return topicFetchArgs;
  }

  /**
   * aggregate metric values from time series
   *
   * @param {timeSeriesData} args
   * @returns Map - <Metric, Aggregated value>
   */
  function _getAggregateMbInAndOut(args) {
    let { timeSeriesData} = args;
    let filteredData = timeSeriesData
    let gropedMetricData = Object.groupBy(
      filteredData,
      ({ metric_name }) => metric_name.value
    );

    let mbAggregateValueMap = new Map();
    let metricNames = _getMetricList();
    for (let metricName of metricNames) {
      for (let metric of gropedMetricData[metricName] ?? []) {
        if (!mbAggregateValueMap.has(metricName)) {
          mbAggregateValueMap.set(
            metricName,
            Number(metric["hour_total_mb_value"]["value"])
          );
        } else
          mbAggregateValueMap.set(
            metricName,
            mbAggregateValueMap.get(metricName) +
              Number(metric["hour_total_mb_value"]["value"])
          );
      }
    }
    return mbAggregateValueMap;
  }

  /**
   * Get bar graph template
   *
   * @param {topicData} args
   * @returns JSON - bar graph template with topic data
   */
  function _getTopicUsageBarGraphData(args) {
    let { topicData } = args;
    let topicUsageBarGraphData = [];
    let groupedTopicData = Object.groupBy(
      topicData,
      ({ topic_name }) => topic_name.value
    );
    let barGraphTemplate = [
      {
        data: [],
        metadata: {
          dataSourceLabel: "BYTES IN (MB)",
          eventData: {
            table: "hermes_usage_metrics",
          },
          groupBy: [],
          format: {
            unitFormat: "{0}",
            precision: 4,
          },
        },
      },
    ];
    let topics = Object.keys(groupedTopicData) ?? [];
    let topicMbAggregateMap = new Map();
    for (let topic of topics) {
      let metricGroupedData;
      metricGroupedData = Object.groupBy(
        groupedTopicData[topic],
        ({ metric_name }) => metric_name.value
      );
      let mbInAggregate = 0,
        mbOutAggregate = 0;
      metricGroupedData?.["BytesInPerSec"] &&
        metricGroupedData["BytesInPerSec"].forEach((data) => {
          mbInAggregate += Number(data["hour_total_mb_value"]["value"]);
        });
      topicMbAggregateMap.set(topic, mbInAggregate);
    }
    let elementObj = {
      elements: [],
      id: "topic_name",
      fieldType: "String",
      label: "Topic Name",
    };
    let sortedEntries = [...topicMbAggregateMap.entries()].sort((a, b) => b[1] - a[1]);
    for (let [topic, aggValues] of sortedEntries) {
      barGraphTemplate[0]["data"].push({
        topic_name: topic,
        value: aggValues,
      });
      elementObj["elements"].push({
        defaultColor: "9,162,191",
        label: topic,
      });
    }
    barGraphTemplate[0]["metadata"]["groupBy"].push(elementObj);
    return barGraphTemplate;
  }

  /**
   * Get table template
   *
   * @param {topicData} args
   * @returns JSON - table template with topic data
   */
  function _getTopicUsageTableData(args, topicUsagePagination) {
    let { topicData, selectedSourceType } = args;
    let topicUsageTableData = [];
    let groupedTopicData = Object.groupBy(
      topicData,
      ({ topic_name }) => topic_name.value
    );
    let topics = Object.keys(groupedTopicData) ?? [];
    let topicTableTemplate = [];
    let topicMbAggregateMap = new Map();
    for (let topic of topics) {
      let metricGroupedData;
      metricGroupedData = Object.groupBy(
        groupedTopicData[topic],
        ({ metric_name }) => metric_name.value
      );
      let rowAggs = aggregateSourceTypeData(metricGroupedData);      
      topicMbAggregateMap.set(topic, rowAggs);
    }
    let sortKey = `bytes_in_${(selectedSourceType || "all").toLowerCase()}`;
    let sortedEntries = [...topicMbAggregateMap.entries()].sort((a, b) =>Number(b[1][sortKey]) - Number(a[1][sortKey]));
    let startIndex = topicUsagePagination.current_page_index * topicUsagePagination.selected_page_size;
    let endIndex = startIndex + topicUsagePagination.selected_page_size;
    let currentIndex = 0;
    for (let [topic, aggValues] of sortedEntries) {
      if (currentIndex >= startIndex && currentIndex < endIndex) {
          topicTableTemplate.push({
          topic_name: topic,
          ...aggValues
         });
       }
       currentIndex ++;
    }   
    return topicTableTemplate;
  }

  /**
   * Get aggregated source types for the metrics data
   *
   * @param metricGroupedData - metrics rows are grouped by metricNames
   * @returns rowAggs - aggregated by various source types for each metric name
   */
  function aggregateSourceTypeData(metricGroupedData) {
    let rowAggs = {};
    let sourceTypes = _getSourceTypes();
    let metricNames = _getMetricList();
    for(let sourceType of sourceTypes){
        let mbAggregates = {};
        let sourceTypeLowerCase = sourceType.toLowerCase();
        for (let metric of metricNames) {
          mbAggregates[metric] = 0;
          if (metricGroupedData?.[metric]) {
            for (let data of metricGroupedData[metric]) {
              let rowSourceType = (data.source_type?.value || "").toLowerCase();
              if(rowSourceType === sourceTypeLowerCase) {
                let val = Number(data["hour_total_mb_value"]["value"]);
                mbAggregates[metric] += val;
              }
            }
          }
       }
       rowAggs[`bytes_in_${sourceTypeLowerCase}`] =  (mbAggregates["BytesInPerSec"] || 0).toFixed(4);
       rowAggs[`bytes_out_${sourceTypeLowerCase}`] =  (mbAggregates["BytesOutPerSec"] || 0).toFixed(4);
    }
    return rowAggs;
  }

  /**
   * Get topic count for topic usage
   *
   * @param {topicData} args
   * @returns number - number of topics
   */
  function _getTopicCountForUsageTableData(args) {
    let { topicData } = args;
    let groupedTopicData = Object.groupBy(
      topicData,
      ({ topic_name }) => topic_name.value
    );
    let topics = Object.keys(groupedTopicData) ?? [];
    return topics.length;
   }

  /**
   * Get dropdown template for appIds
   *
   * @param {appData} args
   * @returns JSON - dropdown template with app data
   */
  function _getAppData(args) {
    let { appData } = args;
    let appdataJson = [];
    //default option
    appdataJson.push({
      id: "all",
      label: "All",
    });
    for (let app of appData) {
      appdataJson.push({
        id: app,
        label: app,
      });
    }
    return appdataJson;
  }

  /**
   * Get dropdown template for serviceIds
   *
   * @param {serviceIdData} args
   * @returns JSON - dropdown template with serviceId data
   */
  function _getServiceIdData(args) {
    let { serviceIdData } = args;
    let serviceIdDataJson = [];
    //default option
    serviceIdDataJson.push({
      id: "all",
      label: "All",
    });
    //let serviceIds = serviceIdData["distinctValues"] ?? [];
    for (let serviceId of serviceIdData) {
      serviceIdDataJson.push({
        id: serviceId,
        label: serviceId,
      });
    }
    return serviceIdDataJson;
  }

  /**
   * Get dropdown template for topics
   *
   * @param {topicData} args
   * @returns JSON - dropdown template with topic data
   */
  function _getTopicData(args) {
    let { topicData } = args;
    let topicDataJson = [];
    if (topicData.length == 0) return [];

    //default option
    topicDataJson.push({
      id: "all",
      label: "All",
    });
    for (let topic of topicData) {
      topicDataJson.push({
        id: topic,
        label: topic,
      });
    }
    return topicDataJson;
  }

  /**
   * Default months for date range picker
   *
   * @param
   * @returns Number
   */
  function _getDefaultMonthsAgo() {
    return 1;
  }

  function _getDateDiffInDays(args) {
    let { startDateStr, endDateStr } = args;
    let startDate = new Date(startDateStr);
    let endDate = new Date(endDateStr);
    let timeDifference = Math.abs(startDate - endDate);
    let daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  }

  function _getNotificationTemplate(args) {
    let { infoMessage } = args;
    let notificationAlertTemplate = {
      items: [
        {
          id: "monthly_roll_up_filter_info",
          status: "info",
          icon: "info-circle-outline",
          content: infoMessage,
          action: {
            type: "dismiss",
          },
        },
      ],
    };
    return notificationAlertTemplate;
  }
}
