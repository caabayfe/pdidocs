
      var SCHEDULED_BP_ACTIVATION = "83cc34e2431331103b465dc36ab8f2e5";
      var gr = new GlideRecord("sysauto_script");
      if (gr.get(SCHEDULED_BP_ACTIVATION))
        gs.executeNow(gr);
