var MIDServerThread = Class.create();

MIDServerThread.prototype = {
    initialize: function() {
      this.active = Packages.java.lang.Thread.activeCount();
      this.allThreads = Packages.java.lang.reflect.Array.newInstance(Packages.java.lang.Thread, this.active);
      Packages.java.lang.Thread.enumerate(this.allThreads);
    },

    getThread : function (threadName) {
      for (var i = 0; i < this.active; i++) {
        if (this.allThreads[i] == null)
          continue;

        if (this.allThreads[i].getName() == threadName) {
          return this.allThreads[i];
        }
      }

      return null;
    },

    listThreads : function () {
      ms.log("Listing threads");
      for (var i = 0; i < this.active; i++) {
        if (this.allThreads[i] == null)
          continue;

        ms.log(this.allThreads[i].getName());
      }
      ms.log("---------------");
    },

    interrupt : function (threadName) {
      var thread = this.getThread(threadName);
      if (thread == null) {
        ms.log("Thread '" + threadName + "' not found");
        return;
      }

      ms.log("interrupting thread '" + threadName + "'");
      thread.interrupt();
    },

    type: 'MIDServerThread'
}
