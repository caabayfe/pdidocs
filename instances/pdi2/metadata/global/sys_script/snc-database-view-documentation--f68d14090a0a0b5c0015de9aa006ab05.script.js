//
// Create or update the Language entry for database views
//
var doc = new GlideRecord('sys_documentation');
doc.addQuery('name', current.name);
doc.addQuery('language', session.getLanguage());
doc.query();
if (doc.next())
   updateDocEntry(doc);
else
   insertDocEntry();

function updateDocEntry(doc) {
   var lg = new GlideLabelGenerator();
   doc.label = getLabel();
   doc.plural = getPlural();
   doc.language = session.getLanguage();
   doc.update();
}

function insertDocEntry() {
   var doc = new GlideRecord('sys_documentation');
   doc.sys_scope = current.sys_scope;
   doc.name = current.name;
   doc.language = session.getLanguage();
   doc.label = getLabel();
   doc.plural = getPlural();
   doc.insert();
}

function getPlural() {
   if (!current.plural.isNil())
       return current.plural.toString();

   var lg = new GlideLabelGenerator();
   return lg.generatePlural(getLabel());
}

function getLabel() {
   if (!current.label.isNil())
       return current.label.toString();

   var lg = new GlideLabelGenerator();
   return lg.generateLabel(current.name);
}
