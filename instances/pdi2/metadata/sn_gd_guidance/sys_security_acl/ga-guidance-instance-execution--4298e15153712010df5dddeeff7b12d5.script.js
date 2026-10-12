answer = false;
var guidanceConstant = new sn_gd_guidance.GuidanceConstants();
var guidanceHistoryRec = new GlideRecord(guidanceConstant.GUIDANCE_HISTORY_TABLE);

// Querying guidance history table with guidance instance execution record
guidanceHistoryRec.addQuery("guidance_instance_execution.sys_id", current.sys_id);
guidanceHistoryRec.query();
if (guidanceHistoryRec.next()) {
    var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
    answer = guidanceModel.isUserValid(guidanceHistoryRec.recommender, guidanceHistoryRec.recommended_by);
}
