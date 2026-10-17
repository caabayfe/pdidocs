// call HierarchicalReference to generate the full_name 
// after business rule
// implementations should set the full_name as the display name
// DEF0518947 - Fix to make sure full_name population works for tables extending cmn_location
// GlideHierarchicalReference.generate() function works well if we pass the GlideRecord created on the root table
var className = current.getTableName();
var cmnLocGr = current;

if (className != 'cmn_location') {
    cmnLocGr = new GlideRecord('cmn_location');
    cmnLocGr.get(current.getUniqueValue());
}

var r = new GlideHierarchicalReference();
r.generate(cmnLocGr);
