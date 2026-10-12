var SnFollowUtil = Class.create();
    SnFollowUtil.prototype = {
      initialize: function () {
      },
    
      type: "SnFollowUtil",
      
      isFollowing: function (userId, recordId) {
        if (!userId || !recordId) return false;
        var mgr = new GlideRecord("live_group_member");

        mgr.addQuery('state', '!=', 'inactive');
        mgr.addQuery('group.document', recordId);
        mgr.addQuery('member.document', userId);

        mgr.query();
        return !!mgr.next();
      }
    };
