var systemCurrencyCode = current.residual.getReferenceCurrencyCode();
current.residual = systemCurrencyCode + ';' + (new FixedAssetUtils()).rollupCosts(current, 'residual');
current.total_cost = systemCurrencyCode + ';' + (new FixedAssetUtils()).rollupCosts(current, 'cost');
current.total_depreciation = systemCurrencyCode + ';'
	+ (current.total_cost.getReferenceValue() - current.residual.getReferenceValue());
current.update();
