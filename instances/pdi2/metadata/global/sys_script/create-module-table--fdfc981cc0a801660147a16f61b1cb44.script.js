// when a module is inserted
// ensure that the table exists and create if it does not
var name = current.name;
var title = current.title;
if (name.length > 0 && system.tableExists(name) == false)  {
  system.print("Creating new table: " + name);
  system.tableCreate(name, title);
  system.addInfoMessage(gs.getMessage("Table created") + ": " + name);
}
