function transform(){
	if (!GlidePluginManager.isActive("com.glide.cs.chatbot"))
	    return [];
	var obj = new CILandingPageCTACardsProcessor();

	return obj.getAllCards();

}
