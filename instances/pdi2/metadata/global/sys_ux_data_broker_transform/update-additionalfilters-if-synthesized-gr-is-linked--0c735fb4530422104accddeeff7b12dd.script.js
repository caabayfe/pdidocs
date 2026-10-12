function transform(input) {
    var result = {};
    var synthGrLinked = false;
    var synthGrId = '088c73a5430302104eaff03a5ab8f22f';
    var additionalFiltersExist = input && input.additionalFilters;
    if (additionalFiltersExist)
        result = JSON.parse(input.additionalFilters);

    // if additionalFilters already has synthesized GR, return early
    if (additionalFiltersExist && result.geniusResultFilters && result.geniusResultFilters.includes(synthGrId))
        return input.additionalFilters;

    var cachedValue = GlideCacheManager.get('search_context_config_synth_gr_linked_cache', input.searchContextConfigId);
    if (cachedValue != null && ('' + cachedValue).trim() != '')
        synthGrLinked = ('' + cachedValue) === 'true';
    else {
        // check if synthesized GR is linked to the search application through search profile
        var searchApplicationRecord = new GlideRecord('sys_search_context_config');
        if (searchApplicationRecord.get(input.searchContextConfigId)) {
            var linkedGRs = [];
            var searchProfileId = searchApplicationRecord.getValue('search_profile');
            var grConfigM2m = new GlideRecord('ais_search_profile_ais_genius_result_configuration_m2m');
            grConfigM2m.addQuery('profile', searchProfileId);
            grConfigM2m.addQuery('genius_result_configuration.active', 'true');
            grConfigM2m.query();

            while (grConfigM2m.next()) {
                linkedGRs.push(grConfigM2m.getValue('genius_result_configuration'));
            }
            synthGrLinked = linkedGRs.includes(synthGrId);
            GlideCacheManager.put('search_context_config_synth_gr_linked_cache', input.searchContextConfigId, synthGrLinked);
        }
    }

    // if synthesized GR is linked, make sure synthesized GR ID is part of additionalFilters
    if (synthGrLinked) {
        if (additionalFiltersExist && result.geniusResultFilters && result.geniusResultFilters.length > 0) {
            result.geniusResultFilters.push(synthGrId);
            return JSON.stringify(result);
        }

        return JSON.stringify({
            'geniusResultFilters': [synthGrId]
        });
    }

    return input.additionalFilters;
}
