if (current.schedule) {
   var gr = new GlideRecord("cmn_schedule");
   if (gr.get(current.schedule))
      gr.deleteRecord();
}
