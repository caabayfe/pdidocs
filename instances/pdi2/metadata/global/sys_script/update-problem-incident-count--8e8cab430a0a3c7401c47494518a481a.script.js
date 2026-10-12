updateProblemCount();

function updateProblemCount() {
   var prev = "";
   if (typeof previous != "undefined" && previous != null)
      prev = previous.problem_id + "";

   if (!current.problem_id.nil())
      updateChildCount(current.problem_id + "");

   if (prev != "")
      updateChildCount(prev);
}

function updateChildCount(id) {
   var rec = new GlideRecord("problem");
   if (!rec.get(id))
      return;

   var gr = new GlideAggregate('incident');
   gr.addQuery("problem_id", id);
   gr.addAggregate('COUNT');
   gr.query();
   var count = 0;
   if (gr.next())
      count = gr.getAggregate('COUNT');
   
   rec.related_incidents = count;
   rec.update();
}
