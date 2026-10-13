/**
 * A runtime automation exception that is thrown in the course of a Discovery.
 * @author Roy Laurie <roy.laurie@service-now.com> RAL
 */
var DiscoveryException = Class.create();

DiscoveryException.prototype = Object.extend(new AutomationException, {
  type: 'DiscoveryException'
});
