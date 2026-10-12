var agg = new GlideAggregate("sys_choice");
agg.addQuery("name", current.name);
agg.addQuery("element", current.element);
agg.addAggregate("COUNT");
agg.query();
var count = 0;

//do not add a base version for an empty choice list
if(agg.next()){
    count = agg.getAggregate("COUNT");
    if(count > 0)
        gs.unloadChoices(current.name, current.element, 'true');

}
