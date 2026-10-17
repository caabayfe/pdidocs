(function executeRule(current, previous /*null when async*/ ) {
	var profile_dictionary_m2m;
	// Link OOTB synonym dictionary
	profile_dictionary_m2m = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
	profile_dictionary_m2m.initialize();
	profile_dictionary_m2m.setValue('profile', current.getUniqueValue());
	profile_dictionary_m2m.setValue('dictionary', 'b29df374c7531010d1cfd9795cc260cd');
	profile_dictionary_m2m.insert();

	var allStopDict=[];
	var grDictionary = new GlideRecord('ais_dictionary');
	grDictionary.addActiveQuery();
	grDictionary.addQuery('type','STOPWORD');
	grDictionary.addQuery('name', 'ENDSWITH', 'default_stop_word_dictionary');
	grDictionary.query();
	while (grDictionary.next()) {
		allStopDict.push(grDictionary.getUniqueValue());
	}

	//   Link OOTB stop word dictionary
	profile_dictionary_m2m = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
	var arrayLength = allStopDict.length;
	for (var i = 0; i < arrayLength; i++) {
		profile_dictionary_m2m.initialize();
		profile_dictionary_m2m.setValue('profile', current.getUniqueValue());
		profile_dictionary_m2m.setValue('dictionary', allStopDict[i]);
		profile_dictionary_m2m.insert();
	}
})(current, previous);
