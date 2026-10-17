var dl = new DiscoveryLogger(current.sys_id);
dl.info('Discovery started', 'Discovery');
if (gs.getProperty('glide.discovery.throttling.enabled', 'false') == 'true')
  dl.info('Discovery sensor throttling is currently enabled', 'Discovery');
