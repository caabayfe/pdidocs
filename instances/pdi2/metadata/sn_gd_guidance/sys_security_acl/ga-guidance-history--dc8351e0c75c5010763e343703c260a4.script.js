answer = false;
var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
answer = guidanceModel.isUserValid(current.recommender, current.recommended_by);
