(function(context) {
    // to let the parent know that this is tier 2 container
    context.__cta_tier = 2;

    var ctaCards = context.children;
	
    ctaCards = addDismissButtonForCtaCards(ctaCards);
    ctaCards = prepareCtaCardsForShuffling(ctaCards);
	
	context.children = ctaCards;
	
	
    function prepareCtaCardsForShuffling(cards) {
        return cards.map(function(card) {
            try {
                card = new sn_oe_sfs.CTACard(card);

				var isCardDismissed = card.isDismissed();
                var isCardDismissedBeyond30Days = (card.isDismissed() && (card.daysPastDismiss() >= 30));
				
                if (isCardDismissedBeyond30Days) // card will be eligible to be on the top, if it's dismissed for more than 30 days
                    card.clearDismissedOn();

                var isCardCompleted = card.isCompleted();
				
                if (isCardCompleted && card.isLastActionOnEmpty())
                    card.setLastActionOnToCurrentDateTime();

                // if card is moved back to pending from completed, then clear last action so that the card can again be on the top
                var isCardPending = (!isCardCompleted && (!isCardDismissed || isCardDismissedBeyond30Days));
                if (isCardPending && !card.isLastActionOnEmpty())
                    card.clearLastActionOn();

                return card.getCard();
            } catch (error) {
                logError('Error in preparing CTA card for shuffling => ', error);
            }
        }).filter(function(card) { // clear out null cards incase of any error
            return (card != null) || (card != undefined);
        });
    }

    function addDismissButtonForCtaCards(cards) {
        return cards.map(function(card) {
            card.props_details = card.props_details || {};

            // set dismiss button by default for cta card
            if (!card.props_details.hasOwnProperty('showDismiss')) {
                card.props_details.showDismiss = true;
            }
			
			return card;
        });
    }

    function logError(prefix, error) {
        var prettyErrorMsg = prefix || '';

        if (error.message)
            prettyErrorMsg += 'message: ' + error.message + '\n';

        if (error.fileName)
            prettyErrorMsg += 'file name: ' + error.fileName + '\n';

        if (error.lineNumber)
            prettyErrorMsg += 'line number: ' + error.lineNumber + '\n';

        if (error.stack)
            prettyErrorMsg += 'stack: ' + error.stack + '\n';

        gs.error(prettyErrorMsg);
    }
})(context);
