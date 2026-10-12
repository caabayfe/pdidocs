class UDCService {
	static type = 'UDCService';

	static #isValidScope(scope) {
		const validScopes = ['sn_udc', 'sn_glider'];
		return validScopes.includes(scope);
	}

	static #validateCallerScope(scopeName) {
		if (!UDCService.#isValidScope(scopeName))
			throw new Error('This must be called from sn_udc or sn_glider scopes');
	}

	static getBuildAgentConfig(studioAppNamespace) {
		UDCService.#validateCallerScope(gs.getCallerScopeName());

		return sn_udc.BuildAgentConfig.getBuildAgentConfig(studioAppNamespace);
	}

	static getCurrentScopeAndUpdateSet() {
		UDCService.#validateCallerScope(gs.getCallerScopeName());

		return global.UDCGlobal.getCurrentScopeAndUpdateSet();
	}

	static removeOldRecentSearches(preferenceKey, preferenceValue) {
		UDCService.#validateCallerScope(gs.getCallerScopeName());

		return sn_udc.UDCUtil.removeOldRecentSearches(preferenceKey, preferenceValue);
	}

	static getNAPConfig(studioConfig) {
		UDCService.#validateCallerScope(gs.getCallerScopeName());

		return sn_udc.UDCGenAIUtils.getNAPConfig.bind(this)(studioConfig);
	}

	static getCurrentUpdateSetScopeForUser() {
		UDCService.#validateCallerScope(gs.getCallerScopeName());

		return sn_udc.DeveloperSessionWatch.getCurrentUpdateSetScopeForUser();
	}

	static cacheAndGetTaxonomyStructure() {
		UDCService.#validateCallerScope(gs.getCallerScopeName());

		return sn_udc.FileTaxonomy.cacheAndGetTaxonomyStructure();
	}
}
