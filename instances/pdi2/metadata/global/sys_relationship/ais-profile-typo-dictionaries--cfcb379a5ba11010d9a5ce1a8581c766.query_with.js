(function refineQuery(current, parent) {

    /** Look up the dictionaries linked to the profile **/
    var linkedDictionariesGR = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
    linkedDictionariesGR.addQuery('profile', parent.sys_id);
    linkedDictionariesGR.query();

    /** Concat the dictionary IDs into a comma separated string **/
    var relevantIdListString = "";
    while (linkedDictionariesGR.next()) {
        relevantIdListString += linkedDictionariesGR.dictionary.sys_id + ',';
    }

    /** Update the query to only get dictionaries linked to the profile that are of the relevant type **/
    current.addQuery('type', 'Spellcheck');
    current.addQuery('sys_id', 'IN', relevantIdListString);

})(current, parent);
