(function(context) {
	context.children = shuffleCards(context.children);

	function shuffleCards(ctaTiers) {
		if(!Array.isArray(ctaTiers) || !ctaTiers.length) {
			return ctaTiers;
		}
		
		// shuffle cards
		ctaTiers.forEach(function(ctaTier, tierIndex) {
			shuffleTierCards(tierIndex, ctaTiers);
		});
		
		ctaTiers = ctaTiers.filter(function(ctaTier) {	
			return (Array.isArray(ctaTier.children) && ctaTier.children.length);
		});
		
		return ctaTiers;
	}

	function shuffleTierCards(tierIndex, ctaTiers) {
		if(!ctaTiers || !ctaTiers[tierIndex]) {
			return ctaTiers;
		}

		var ctaCards = ctaTiers[tierIndex].children;
		if(!ctaCards) {
			return ctaTiers;
		}

		// can push to tier one only if tier 1 is empty. If tier 1 is not empty, do not push
		var canPushToTier1 = !ctaTiers[0].children.length;

		ctaTiers[tierIndex].children = ctaCards.filter(function(ctaCard) {
			var _cardTier = getTier(ctaCard);

			if(!_cardTier || isNaN(_cardTier)) { // if no card tier object is found, leave the card as it is
				return true;
			}

			var expectedTier = parseInt(_cardTier);

			var isCardAlreadyInExpectedTier = (expectedTier == parseInt(tierIndex + 1));
			if(isCardAlreadyInExpectedTier) {
				return true;
			}

			if(expectedTier == 1 && !canPushToTier1) {
				return true;
			}

			// push card to its respective tier
			ctaTiers[expectedTier - 1].children.push(ctaCard);
			
			return false;
		});
	}

	function getTier(card) {
		if (card.__tier)
			return card.__tier;

		else if (card.children) {
			var screens = card.children;
			for (i = 0; i < screens.length; i++) {
				if (screens[i].__tier) return screens[i].__tier;
			}
		}
	}
})(context);
