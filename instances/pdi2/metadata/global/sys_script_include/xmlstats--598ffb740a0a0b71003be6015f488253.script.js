var XMLStats = Class.create();

XMLStats.prototype = {
  initialize : function(inc) {
      this.includes = inc.split(",");
      this.ArrayUtil = new ArrayUtil();
  },

  write: function() {
    if (this.ArrayUtil.contains(this.includes, "memory"))
        this.writeMemory();

    if (this.ArrayUtil.contains(this.includes, "jvm")) {
        this.writeJVM();
        this.writeGC();
    }
  },

  writeMemory: function() {
        try {
            var memoryStats = new GlideJvmPlatformStats().memoryStats;
            this.mw.createElement("system.memory_metaspace.max", Math.trunc(memoryStats.max / 1024 / 1024));
            this.mw.createElement("system.memory_metaspace.total", Math.trunc(memoryStats.committed / 1024 / 1024));
            this.mw.createElement("system.memory_metaspace.in.use", Math.trunc(memoryStats.used / 1024 / 1024));
        } catch (e) { } // we have no JMX stuff 
  },

  writeJVM: function() {
        try {
            var glideJvmPlatformStats = new GlideJvmPlatformStats();

            this.mw.createElement("jvm.version", gs.getJavaVersion());
            var upTime = (new Packages.java.util.Date().getTime() - GlideServlet.getServlet().getStartTime().getTime());
            var friendlyJVMTime = new String(GlideDateUtil.getDateTimeString(parseInt(upTime/1000), false));
            this.mw.createElement("jvm.time", upTime);
            this.mw.createElement("jvm.time_friendly", friendlyJVMTime);
            this.mw.createElement("jvm.java_opts", glideJvmPlatformStats.javaOpts);

            var cpuTime = glideJvmPlatformStats.cpuTime;
            cpuTime = cpuTime / (1000*1000);
            var friendlyCPU = new String(GlideDateUtil.getDateTimeString(Math.trunc(cpuTime / 1000), false));
            this.mw.createElement("jvm.cpu.time", cpuTime);
            this.mw.createElement("jvm.cpu.time_friendly", friendlyCPU);

            this.mw.createElement("jvm.cpu.count", GlideSystemUtil.getAvailableProcessors());

            var classLoading = glideJvmPlatformStats.classLoadingStats;
            this.mw.createElement("jvm.classes.loaded", classLoading.loadedClassCount);
            this.mw.createElement("jvm.classes.unloaded", classLoading.unloadedClassCount);
            this.mw.createElement("jvm.classes.verbose", classLoading.verbose);
        } catch (e) { } // we have no JMX stuff 
  },

  writeGC: function() {
        this.mw.open("jvm.gc");
        var allGcStats = new GlideJvmPlatformStats().gcStats;
        for (var i = 0; i < allGcStats.length; i++) {
            this._writeGCAttributes(allGcStats[i])
        }
        this.mw.close("jvm.gc");
  },

  _writeGCAttributes: function(gcStats) {
    var count = gcStats.count;
    var time = gcStats.time;

    var friendlyTime = new String(GlideDateUtil.getDateTimeString(Math.trunc(time / 1000), false));

    this.mw.open("gc");

    var name = gcStats.name;
    if (name.indexOf('name=') > -1)
        name = name.substring(name.indexOf('name=') + 5);

    this.mw.createElement("name", name);

    var upTime = (new Packages.java.util.Date().getTime() - GlideServlet.getServlet().getStartTime().getTime());
    var upTimeMin = (upTime/1000)/60;
    var fiveMinutes = upTimeMin / 5;

    this.mw.createElement("run_count", count);
    this.mw.createElement("run_count_per_fivemin", this._formatNum(count/fiveMinutes));
    this.mw.createElement("run_time", time);
    this.mw.createElement("run_time_readable", friendlyTime);
    this.mw.createElement("avg_run_time", (time / count)/1000);

    this.mw.close("gc");
  },

  _formatNum: function(num) {
      return num.toFixed(3);
  },

  setMarkupWriter: function(mw) {
      this.mw = mw;
  },

  type: "XMLStats"
}
