(function canShowRAPanelForITSM(params) {
	return new sn_itsm_ra.RecommendedActionsSOWUtil().canViewRAPanel(params.data.table);
})(inputProperties);
