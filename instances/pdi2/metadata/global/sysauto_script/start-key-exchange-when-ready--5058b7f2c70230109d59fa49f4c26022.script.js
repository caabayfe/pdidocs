(function(){
	gs.error("Resource Exchange: started auto key exchange process.");
	new SNC.KMFKeyExchangePostCloneAPI().startKeyExchangeCloneFromJob();
	current.active = false;
	current.update();
}());
