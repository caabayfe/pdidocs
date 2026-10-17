var gth = new GuidedTourDesignerHelper();
if(!gth){
	answer = false;
}else{
	answer = gth.canUserUpdateTours(current.guide.type);
} 
