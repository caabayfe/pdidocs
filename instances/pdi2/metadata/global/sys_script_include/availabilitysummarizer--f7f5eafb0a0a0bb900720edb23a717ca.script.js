var AvailabilitySummarizer = Class.create();

AvailabilitySummarizer.prototype = {
  
  initialize : function() {
    this.cmdb_ci = null;
    this.commitment = null;
    this.UTILS =  new global.AvailabilityUtils();
  },

  summarize : function(start) {
    if (!start)
       start = gs.beginningOfToday();

    if (typeof start == 'string') {
      this.start = new GlideDateTime();
      this.start.setValue(start);
    } else
      this.start = start; 
    this._daily();
	
    if (gs.isLastDayOfYear(this.start))
      this._annually();
    
    if (gs.isLastDayOfMonth(this.start))
      this._monthly();

    if (gs.isLastDayOfWeek(this.start)) 
	  this._weekly();

    // calculate last 7,30 days and the last 12 months if called from the daily scheduled job
    if (gs.beginningOfDay(this.start) == gs.beginningOfYesterday()) {
        this._lastMonths(12);
        this._lastDays(30);
        this._lastDays(7);
    }
  },

  _daily : function() {
    var sd = gs.beginningOfDay(this.start);
    var ed = gs.endOfDay(this.start);
    var start = new GlideDateTime(sd);
    var end = new GlideDateTime(ed);
    end.addSeconds(1);
    this._cleanExisting(start, 'daily');
    var ac = new AvailabilityCalculator();
    if (this.cmdb_ci != null)
      ac.setCI(this.cmdb_ci);
    if (this.commitment != null)
      ac.setCommitment(this.commitment);
    ac.calculate(start, end);
  },

  _weekly : function() {
    gs.print('WEEKLY');
    var sd = gs.beginningOfWeek(this.start);
    var ed = gs.endOfWeek(this.start);
    var start = new GlideDateTime(sd);
    var end = new GlideDateTime(ed);
    end.addSeconds(1);
    this._cleanExisting(start, 'weekly');
	  var ac = new AvailabilityCalculator();
	  if (this.cmdb_ci != null)
		  ac.setCI(this.cmdb_ci);
	  if (this.commitment != null)
		  ac.setCommitment(this.commitment);
	  ac.calculate(start, end, 'weekly');
  },

   _monthly : function() {
    gs.print('MONTHLY');
    var sd = gs.beginningOfMonth(this.start);
    var ed = gs.endOfMonth(this.start);
    var start = new GlideDateTime(sd);
    var end = new GlideDateTime(ed);
    end.addSeconds(1);
    this._cleanExisting(start, 'monthly');
	  var ac = new AvailabilityCalculator();
	  if (this.cmdb_ci != null)
		  ac.setCI(this.cmdb_ci);
	  if (this.commitment != null)
		  ac.setCommitment(this.commitment);
	  ac.calculate(start, end, 'monthly');
  },

  _annually : function() {
    gs.print('ANNUALLY');
    var sd = gs.beginningOfYear(this.start);
    var ed = gs.endOfYear(this.start);
    var start = new GlideDateTime(sd);
    var end = new GlideDateTime(ed);
    end.addSeconds(1);
    this._cleanExisting(start, 'annually');
	var ac = new AvailabilityCalculator();
	if (this.cmdb_ci != null)
	  ac.setCI(this.cmdb_ci);
	if (this.commitment != null)
	  ac.setCommitment(this.commitment);
	ac.calculate(start, end, 'annually');
  },

  // last n days includes today, so starts n-1 days ago
  _lastDays : function(days) {
    gs.print('LAST ' + days + ' DAYS');
	// calculate today's daily record, previously _ensureInterval() method used to create a record for today
	var ac = new AvailabilityCalculator();
	var today = new GlideDateTime(gs.beginningOfToday());  
	this._cleanExisting(today, 'daily');
	if (this.cmdb_ci != null)
		ac.setCI(this.cmdb_ci);
	if (this.commitment != null)
		ac.setCommitment(this.commitment);
	ac.calculate(today, new GlideDateTime(gs.beginningOfTomorrow()));
	
    var sd = gs.beginningOfDay(this.start);
    // want to include today, so make sure end date is today's end
    var ed = gs.endOfDay(gs.beginningOfToday());
    var start = new GlideDateTime(sd);
	//PRB1304264 - want to show 6/29 days ago, instead of 7/30 days ago
    start.subtract((days - 2) * 24 * 60 * 60 * 1000);
    var end = new GlideDateTime(ed);
    end.addSeconds(1);
    this._cleanExisting("", 'last' + days + 'days');
	ac.calculate(start, end, 'last' + days + 'days');
  },

  // last n months includes this month, so starts n-1 months ago
  _lastMonths : function(months) {
    gs.print('LAST ' + months + ' MONTHS');
    var c = GlideSystemDateUtil.getCalendar(this.start);
    var d = GlideSysDateUtil.gernateDate(c, 1, 1 - months, 8677);
    var sd =  new GlideDateTime(d);
    var ed = gs.endOfMonth(this.start);
    var start = new GlideDateTime(sd);
    var end = new GlideDateTime(ed);
    end.addSeconds(1);
    this._cleanExisting("", 'last' + months + 'months');

	  var ac = new AvailabilityCalculator();
	  if (this.cmdb_ci != null)
		  ac.setCI(this.cmdb_ci);
	  if (this.commitment != null)
		  ac.setCommitment(this.commitment);
	  ac.calculate(start, end, 'last' + months + 'months');
  },

  _cleanExisting : function(start, type) {
    var md = new GlideMultipleDelete('service_availability');
    md.addQuery('type', type);
    if (start != "")
      md.addQuery('start', start);
    if (this.cmdb_ci != null)
      md.addQuery('service_offering', this.cmdb_ci).addOrCondition('cmdb_ci', this.cmdb_ci);
    if (this.commitment != null)
      md.addQuery('service_commitment', this.commitment);
    md.execute();
  },

  _summarize : function(start, end, type) {
    gs.print('SUMMARIZING AVAILABILITY ' + start + ' ' + end + '  ' + type);
    var ga = new GlideAggregate('service_availability');
    ga.addQuery('type', 'daily');
    ga.addQuery('start', '>=', start);
    ga.addQuery('start', '<', end);
    if (this.cmdb_ci != null)
      ga.addQuery('service_offering', this.cmdb_ci).addOrCondition('cmdb_ci', this.cmdb_ci);
    if (this.commitment != null)
      ga.addQuery('service_commitment', this.commitment);
    ga.groupBy('service_offering');
    ga.groupBy('service_commitment');
    ga.addAggregate('AVG', 'absolute_availability');
    ga.addAggregate('SUM', 'absolute_downtime');
    ga.addAggregate('SUM', 'scheduled_downtime');
    ga.addAggregate('SUM', 'absolute_count');
    ga.addAggregate('SUM', 'scheduled_count');
    ga.addAggregate('SUM', 'ast');
    ga.addAggregate('SUM', 'allowed_downtime');
    ga.addAggregate('COUNT');
    ga.query();

    while (ga.next()) {
      var absolute_avail = ga.getAggregate('AVG', 'absolute_availability');
      var absolute = ga.getAggregate('SUM', 'absolute_downtime');

	  var scheduled = ga.getAggregate('SUM', 'scheduled_downtime');
      scheduled = this._getDuration(scheduled);
	  var ast = ga.getAggregate('SUM', 'ast');
	  ast = this._getDuration(ast);
	  
	  var scheduled_avail = 100;
	  if (ast.getNumericValue() > 0)
	      scheduled_avail = 100 * ((ast.getNumericValue() - scheduled.getNumericValue()) / ast.getNumericValue());
      
	  var ac = ga.getAggregate('SUM', 'absolute_count');
      var sc = ga.getAggregate('SUM', 'scheduled_count');
      // computed values that cannot come by aggregating values in dailies
      sc = parseInt(sc);
      var mtDen = sc;
      if (mtDen == 0)
         mtDen = 1;
 
      var mtbf = (ast.getNumericValue()-scheduled.getNumericValue())/parseInt(mtDen);
      mtbf = new GlideDuration(mtbf);
      var mtrs = scheduled.getNumericValue()/parseInt(mtDen);
	  mtrs = new GlideDuration(mtrs);
      
      var allowed = ga.getAggregate('SUM', 'allowed_downtime');
      allowed = this._getDuration(allowed);
      var met = scheduled.getNumericValue() <= allowed.getNumericValue();
      var cmdb_ci = this.UTILS.getCiFromCommitment(ga.service_commitment);

      var ar = new AvailabilityRecord(cmdb_ci, start, end);
      ar.setType(type);
      ar.setCiClass(this.UTILS.getCiClassFromCommitment(ga.service_commitment));
      ar.post(ga.service_commitment, absolute, scheduled, absolute_avail, scheduled_avail, ac, sc, ast, mtbf, mtrs, allowed, met);
    }
  },

  _getDuration : function(s) {
      var answer = new GlideDuration();
      answer.setValue(s);
      return answer;
  },

  setCommitment : function(id) {
    this.commitment = id;
  },

  setCI : function(cmdb_ci) {
    this.cmdb_ci = cmdb_ci;
  }

};
