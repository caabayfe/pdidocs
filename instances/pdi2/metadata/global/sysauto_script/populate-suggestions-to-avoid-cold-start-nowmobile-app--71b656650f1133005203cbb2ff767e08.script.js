gs.info("Data Import started");

var maxLogEntries = 500000;

//Fetch Application ConfigId from sys_search_context_config table
var mobileRequestConfigId = "81d0f85673032300c342d5fdbdf6a7b2";
var builder = new BuildSuggestionsFromLogTable(maxLogEntries);

//Insert Search Events, Search Source Events and Build Suggestions
builder.buildScopedSuggestions(mobileRequestConfigId);

gs.setProperty('glide.search.suggestions.runcoldstartscript.me', 'false');
gs.info("Data Import ended");
