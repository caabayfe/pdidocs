var VAAISearchCardHelperFactory = Class.create();

VAAISearchCardHelperFactory.getCardName = function(aiSearchCardName, mode, deviceType, version, needNDS) {
	switch (version) {
		case 'Xanadu':
			return global.VAAISearchCardHelperXanadu.getCardName(aiSearchCardName, mode, deviceType, needNDS);
		default:
			return global.VAAISearchCardHelperXanadu.getCardName(aiSearchCardName, mode, deviceType, needNDS);
	}
};
