/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, helpers}) {

  const translations = {};
  
  // Each string on a separate line so ServiceNow can scan and identify them
  const articlesExpiring = await helpers.translate("Articles expiring in 90 days");
  const myFeedbackTasks = await helpers.translate("My Feedback Tasks");
  const myApprovals = await helpers.translate("My Approvals");
  const myArticleChecklist = await helpers.translate("My Article Checklist (AQI)");
  const myTranslationRequests = await helpers.translate("My Translation Requests");
  const myPendingGroupRequests = await helpers.translate("My Pending Group Requests");
  const myFlagged = await helpers.translate("My Flagged");
  const myArticleOptimization = await helpers.translate("My Article Optimization");
  
  // Build the translations object
  translations["Articles expiring in 90 days"] = articlesExpiring;
  translations["My Feedback Tasks"] = myFeedbackTasks;
  translations["My Approvals"] = myApprovals;
  translations["My Article Checklist (AQI)"] = myArticleChecklist;
  translations["My Translation Requests"] = myTranslationRequests;
  translations["My Pending Group Requests"] = myPendingGroupRequests;
  translations["My Flagged"] = myFlagged;
  translations["My Article Optimization"] = myArticleOptimization;

  // Create reverse lookup map
  const reverseLookup = {
    [articlesExpiring]: "Articles expiring in 90 days",
    [myFeedbackTasks]: "My Feedback Tasks",
    [myApprovals]: "My Approvals",
    [myArticleChecklist]: "My Article Checklist (AQI)",
    [myTranslationRequests]: "My Translation Requests",
    [myPendingGroupRequests]: "My Pending Group Requests",
    [myFlagged]: "My Flagged",
    [myArticleOptimization]: "My Article Optimization"
  };
  
  api.setState("tabTranslations", translations);
  api.setState("reverseTranslations", reverseLookup);
  api.data.fetch_requires_attention_tab_labels.refresh(); 
}
