GlideCacheManager.flush("syscache_category_" + current.sys_id);

// tell the UI to refresh the navigator
var notification = new UINotification('system_event');
notification.setAttribute('event', 'refresh_nav');
notification.send();
