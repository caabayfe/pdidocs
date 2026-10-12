function showRecalcAvailabilityAction() {
   var com = new GlideRecord("service_offering_commitment");
   com.addQuery("service_offering", current.sys_id);
   com.addQuery("service_commitment.type", "availability");
   com.orderBy("order");
   com.orderBy("name");
   com.query();
   
   while (com.next()) {
      var avail = new GlideAggregate("service_availability");
      avail.addAggregate("COUNT")
      avail.addQuery("type", "daily");
      avail.addQuery("service_offering", com.service_offering);
      avail.addQuery("service_commitment", com.service_commitment);
      avail.addQuery("start", ">=", gs.daysAgoStart(30));
      avail.addQuery("start", "<", gs.beginningOfToday());
      avail.query();
      if (avail.next() && avail.getAggregate("COUNT") <= 23)
         return true;

      avail = new GlideAggregate("service_availability");
      avail.addAggregate("COUNT")
      avail.addQuery("type", "monthly");
      avail.addQuery("service_offering", com.service_offering);
      avail.addQuery("service_commitment", com.service_commitment);
      avail.addQuery("start", ">=", gs.monthsAgoStart(12));
      avail.addQuery("start", "<", gs.beginningOfToday());
      avail.query();
      if (avail.next() && avail.getAggregate("COUNT") <= 8)
         return true;
   }

   return false;
}
