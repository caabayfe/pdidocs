// fire a rollup event on every change of a ci
// don't need to worry about firing an event on insert as it can't possibly have a relation yet
// likewise don't need to worry about firing an event on delete as we'll get a host of delete messages for each
// relationship as the delete cascades

run();

function run() {
   var gr = new GlideRecord('cmdb_ci');
   if (!gr.get(current.child))
      return;

   var triplet = current.child + ',' + current.parent + ',' + current.child.sys_class_name;
 
   if (current.operation() == "insert" || current.operation() == "update") {
       gs.eventQueue('relationship.rollup.relationship', current, current.type, triplet);
   }
   else if (current.operation() == "delete")
   {
       // Don't pass instance (current) since it is already deleted from DB. If you pass current (i.e. sys_id), the code checks if       // the record exists in the database. Since it is already deleted at this point, the code will not fire an event, which is
       // not what we want. By passing "null", the code ignores validation of the instance and fires an event. 
       gs.eventQueue('relationship.rollup.relationship', null, current.type, triplet);
   }
}
