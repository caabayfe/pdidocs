var E2EUtil = Class.create();
E2EUtil.prototype = {
  initialize: function () {},
  ping: function () {
    return 'local';
  },
  pong: function () {
    return 'm2';
  },
  peng: function () {
    return 'm2-refresh';
  },
  type: 'E2EUtil'
};
