calculateAssetRefreshEligibility();
function calculateAssetRefreshEligibility(){
	try{
		gs.log('SAM - Compute Asset Refresh Eligibility job status: Running');
		new SAMRefreshEligibityCalculator().process();
	}
	catch(error){
		gs.error('SAM - Compute Asset Refresh Eligibility job status: Failed ' + error);
	}
	gs.log('SAM - Compute Asset Refresh Eligibility job status: Completed');
}
