
			 /** * @param {params} params * @param {api} params.api * @param {TransformApiHelpers} params.helpers */ function evaluateProperty({api, helpers}) { if (!api.state.selectedCard) return false; return api.item.index === api.state.selectedCard.index; }
