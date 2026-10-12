/**
 * Expose the VMWare Java API
 */
var vim = Packages.com.vmware.vim;
var vim25 = Packages.com.vmware.vim25;

/**
 * Java imports
 */
var URL = Packages.java.net.URL;
var HashMap = Packages.java.util.HashMap;
var Map = Packages.java.util.Map;
var Calendar = Packages.java.util.Calendar;

/**
 * Service-now.com imports
 */
var MIDServer = Packages.com.service_now.mid.MIDServer;
var ThreadManager = Packages.com.service_now.mid.queue_worker.ThreadManager;
var MIDScript = Packages.com.service_now.mid.script.MIDScript;
var MIDScriptType = Packages.com.service_now.mid.script.MIDScriptType;
var IPAddressUtil = Packages.com.glide.util.IPAddressUtil;
var CustomizationPassword = Packages.com.service_now.mid.probe.vmware.CustomizationPassword;

var SOURCE = Packages.com.glide.util.IConstants.SOURCE;

var escape = Packages.com.glide.util.StringUtil.escapeTitle;
var nil = Packages.com.glide.util.StringUtil.nil;

/**
 * Constants
 */
var VCENTER = "vcenter";
var INSTANCE = "url";
var HOST_SYSTEMS = "hostSystems";
var HOST_SYSTEM = "hostSystem";
var DATA_STORES = "dataStores";
var DATA_STORE = "dataStore";
var MO_RESOURCE_POOL = "ResourcePool"; // Managed object name in vSphere Java API
var MO_HOST_SYSTEM = "HostSystem"; // Managed object name in vSphere Java API
var DEFAULT_RESOURCE_POOL = "Resources";
var IGNORE_CERT = "ignoreCert";
var VIRTUAL_MACHINES = "virtualMachines";
var VIRTUAL_MACHINE = "virtualMachine";
var RESOURCE_POOLS = "resourcePools";
var NAME = "name";
var CPUS = "cpus";
var MEM_MB = "memInMB";
var UUID = "uuid";
var PATH = "path";
var POWER_STATUS = "powerStatus";
var TEMPLATE = "template";
var VIRTUAL_DISKS = "virtualDisks";
var VIRTUAL_DISK = "virtualDisk";
var CAPACITY_KB = "capacityInKB";
var LABEL = "label";
var SUMMARY = "summary";
var VIRTUAL_NICS = "virtualNics";
var VIRTUAL_NIC = "virtualNic";
var NETWORK = "network";
var MAC_ADDRESS = "macAddress";
var RESOURCE_POOL = "resourcepool";
var RESOURCE_POOL_OWNER = "resourcepoolowner";

var VM_NAME = "vmname";
var ACTION = "action";
var POWER_ON = "powerOn";
var POWER_OFF = "powerOff";
var Shut_Down_Guest = "shutdownGuest";
var CLONE = "clone";
var CLONE_NAME = "clonename";

var DOMAIN = "domain";
var HOSTNAME = "hostname";
var IP_ADDRESS = "ipaddress";
var NETMASK = "netmask";
var GATEWAY = "gateway";
var DNS = "dns";
var ADMIN_PASSWORD = "adminPassword";
var DOMAIN_ADMIN = "domainAdmin";
var DOMAIN_ADMIN_PASSWORD = "domainAdminPassword";
var FULLNAME = "fullname";
var ORGANIZATION = "organization";
var PRODUCT_KEY = "productKey";
var TIME_ZONE = "timezone";
var CONFIGURE_LINUX = "Configure Linux";
var CONFIGURE_WINDOWS = "Configure Windows";
