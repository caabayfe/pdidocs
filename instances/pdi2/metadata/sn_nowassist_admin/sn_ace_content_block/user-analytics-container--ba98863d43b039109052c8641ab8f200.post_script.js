(function(context, pageParams, blockcontext, dataParams){
	var cardsOrder = NAASkillConfigUtil.getHomePageCardsOrder();
	var children = [...context.children];
	for (var i = 0; i < children.length; i++) {
		var newIndex = cardsOrder[children[i].elementId];
		context.children[newIndex] = children[i];
	}
})(context, pageParams, blockcontext, dataParams);
