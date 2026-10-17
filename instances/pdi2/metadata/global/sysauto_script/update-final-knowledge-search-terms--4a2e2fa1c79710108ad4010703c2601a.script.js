var gd = null;
//Uncomment below two lines and set the date to de-duplicate searches of a specific date.
//gd = new GlideDate();
//gd.setValue("2020-06-27");
var searchDedup = new global.KBSearchDeduplication();
searchDedup.process(gd);
