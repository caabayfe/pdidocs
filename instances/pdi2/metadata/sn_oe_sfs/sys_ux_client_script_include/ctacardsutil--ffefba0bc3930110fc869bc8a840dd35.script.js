function include({
    imports
}) {
    return {
        updatePropsDetailsForCtaCard: updatePropsDetailsForCtaCard,
        getCurrentDateTime: getCurrentDateTime,
        shuffleCtaCards: shuffleCtaCards
    };

    function getPageBodyContainer(contentBlocks) {
        return contentBlocks[1];
    }

    function updatePropsDetailsForCtaCard(contentBlocks, cardId, propsDetails) {
        patchPropsDetails(cardId, propsDetails, contentBlocks);

        function patchPropsDetails(cardId, propsDetails, contentBlocks) {
            for (let i = 0; i < contentBlocks.length; i++) {
                const contentBlock = contentBlocks[i];
                if (contentBlock.block_id === cardId) {
                    contentBlocks[i].props_details = contentBlocks[i].props_details || {};
                    contentBlocks[i].props_details = { ...contentBlocks[i].props_details,
                        ...propsDetails
                    };
                    break;
                } else if (Array.isArray(contentBlock.children) && contentBlock.children.length) {
                    patchPropsDetails(cardId, propsDetails, contentBlock.children);
                }
            }
        }
    }

    function getCurrentDateTime() {
        var dateTime = new Date();
        return dateTime.getUTCFullYear() + "-" +
            ('0' + (dateTime.getUTCMonth() + 1)).slice(-2) + "-" +
            ('0' + dateTime.getUTCDate()).slice(-2) + " " +
            ('0' + dateTime.getUTCHours()).slice(-2) + ":" +
            ('0' + dateTime.getUTCMinutes()).slice(-2) + ":" +
            ('0' + dateTime.getUTCSeconds()).slice(-2);
    }

    function shuffleCtaCards(contentBlocks) {
        class CTACard {
            constructor(card) {
                this.card = card;
                this.card.props_details = this.card.props_details || {};
            }

            /**
             * return -1 if card is pending, else the 'last action on' date time in ms
             */
            getLastActionOnInMs() {
                var lastActionOn = this.card.props_details.last_action_on;
                if (!lastActionOn)
                    return -1;

                lastActionOn = lastActionOn.replace(/\s/, 'T');

                var lastActionOnDateTimeInMs = new Date(lastActionOn).getTime() || 0;
                return lastActionOnDateTimeInMs;
            }

            isComplete() {
                if (this.card.hasOwnProperty('__is_complete')) {
                    return (this.card.__is_complete == true);
                } else if (this.card.children) {
                    var screens = this.card.children;
                    var screenIndex;
                    for (screenIndex = 0; screenIndex < screens.length; screenIndex++) {
                        var screen = screens[screenIndex];
                        if (screen.hasOwnProperty('__is_complete')) {
                            return (screen.__is_complete == true);
                        }
                    }
                    return true;
                }
            }

            getCard() {
                return this.card;
            }
        }

        let ctaCards = getCtaCards(contentBlocks);
        ctaCards = ctaCards.map(card => new CTACard(card));

        ctaCards.sort((card1, card2) => card1.getLastActionOnInMs() - card2.getLastActionOnInMs());

        let tier1Cards = [];
        let tier2Cards = [];

        ctaCards.forEach(function(card) {
            var canPushToTier1 = (!card.isComplete() && (tier1Cards.length < 3));
            if (canPushToTier1) {
                tier1Cards.push(card.getCard());
            } else {
                tier2Cards.push(card.getCard());
            }
        });

        setTier1Cards(tier1Cards, contentBlocks);
        setTier2Cards(tier2Cards, contentBlocks);

        return [ ...contentBlocks ];
    }

    function getCtaCards(contentBlocks) {
        var tier1 = getTier1Cards(contentBlocks);
        var tier2 = getTier2Cards(contentBlocks);

        return tier1.concat(tier2);
    }

    function setTier1Cards(tierChildren, contentBlocks) {
        let pageBodyContainer = getPageBodyContainer(contentBlocks);
        setTier(1, tierChildren, pageBodyContainer);
    }

    function setTier2Cards(tierChildren, contentBlocks) {
        let pageBodyContainer = getPageBodyContainer(contentBlocks);
        setTier(2, tierChildren, pageBodyContainer);
    }

    function getTier1Cards(contentBlocks) {
        let pageBodyContainer = getPageBodyContainer(contentBlocks);
        return getTierCards(1, pageBodyContainer);
    }

    function getTier2Cards(contentBlocks) {
        let pageBodyContainer = getPageBodyContainer(contentBlocks);
        return getTierCards(2, pageBodyContainer);
    }

    function setTier(tierNumber, tierChildren, pageBodyContainer) {
        var tierIndex = findTierIndex(tierNumber, pageBodyContainer);
        pageBodyContainer.children[tierIndex].children = tierChildren;
    }

    function getTierCards(tierNumber, pageBodyContainer) {
        var tierIndex = findTierIndex(tierNumber, pageBodyContainer);
        if (tierIndex == -1) {
            return [];
        }
        const ctaTier = pageBodyContainer.children[tierIndex];
        return ctaTier.children || [];
    }

    function findTierIndex(tierNumber, context) {
        if (!context || !Array.isArray(context.children))
            return -1;

        var index;
        for (index = 0; index < context.children.length; index++) {
            var child = context.children[index];
            if (child.__cta_tier == tierNumber) {
                return index;
            }
        }

        return -1;
    }
}
