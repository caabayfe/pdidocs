if (current.spm_service_portfolio)
	answer = (new global.SPMUtilsFactory().getUtils()).checkPortfolioAuthorization(current.spm_service_portfolio);
else
	answer = true;
