/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

  var translatedTabSelection;
  var tabSelection;

  if (event.name == "DATA_FETCH_SUCCEEDED") {
    translatedTabSelection = api.state.reqAttentionTabContent;
  } else if (event.name == "UXF_TAB_SET#TAB_SELECTED") {
    translatedTabSelection = event.payload.selectedTabLabel;
  }

  tabSelection = api.state.reverseTranslations[translatedTabSelection];
  
  // Helper function to truncate databroker results
  const safeSlice = arr => Array.isArray(arr) ? arr.slice(0, 4) : [];

  const dataMap = {
    'My Approvals': safeSlice(api.data.fetch_my_pending_approvals.results),
    'My Pending Group Requests': safeSlice(api.data.fetch_pending_group_requests.results),
    'My Feedback Tasks': safeSlice(api.data.fetch_my_feedback_tasks.results),
    'My Article Checklist (AQI)': safeSlice(api.data.fetch_aqi_checklist.results),
    'My Flagged': safeSlice(api.data.fetch_my_flagged_articles.results),
    'Articles expiring in 90 days': safeSlice(api.data.fetch_expiring_articles.results),
    'My Translation Requests': safeSlice(api.data.fetch_my_translation_requests.results),
    'My Article Optimization': safeSlice(api.data.fetch_my_article_for_optimization.output)
  };

  const records = dataMap[tabSelection] || [];
  
  // Important: This code stops race conditions as the client script is called from
  // multiple data brokers
  if (!records || records.length === 0) {
    api.setState("selectedTabRecords", []);
    return;
  } 

  // Helper functions for meta extraction
  function getMeta(item) {
    switch(tabSelection) {
      case 'My Approvals':
        return {
          label: item._row_data.displayValue,
          meta1: item.state.displayValue,
          dot1: "",
          dot2: ""
        };
      case 'My Article Optimization':
        return {
          label: item.label,
          meta1: item.number,
          dot1: "",
          dot2: ""
        };
      case 'My Pending Group Requests':
        return {
          label: item.variables.variables[1].variableDisplayValue,
          meta1: item.number.displayValue,
          meta2: item.state.displayValue,
          meta3: item.due_date.displayValue,
          dot1: "•",
          dot2: "•"
        };
      case 'My Feedback Tasks':
        return {
          label: item.description.displayValue ? item.description.displayValue : item.number.displayValue,
          meta1: item.number.displayValue,
          meta2: item.state.displayValue,
          dot1: "•",
          dot2: ""
        };
      case 'My Article Checklist (AQI)':
        return {
          label: item.article._reference.short_description.displayValue,
          meta1: item.number.displayValue,
          meta2: item.version_author.displayValue,
          meta3: item.aqi_score.value || "",
          dot1: "•",
          dot2: item.aqi_score.value ? "•" : ""
        };
      case 'My Flagged':
      case 'Articles expiring in 90 days': {
        const views = item.sys_view_count.displayValue;
        return {
          label: item.short_description.displayValue,
          meta1: item.number.displayValue,
          meta2: views,
          dot1: "•",
          dot2: "•",
          rating: item.rating.value,
          route: "kb_view"
        };
      }
      case 'My Translation Requests':
        return {
          label: item.document.displayValue,
          meta1: item.number.displayValue,
          meta2: item.source_language.displayValue,
          meta3: item.target_language.displayValue,
          dot1: "•",
          dot2: "•"
        };
      default:
        return {};
    }
  }

  // Build array of record objects
  const recordObjects = [];
  for (const item of records) {
    const meta = getMeta(item);
    recordObjects.push({
      sys_id: item._row_data ? item._row_data.uniqueValue : item.sys_id,
      ...meta
    });
  }

  // Update state parameter with the array
  api.setState("selectedTabRecords", recordObjects);
}
