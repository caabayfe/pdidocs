var DiscoveryClassification = SncDiscoveryClassification;
var DeviceHistory = SncDeviceHistory;
var MakeAndModel = SncMakeAndModel;
var Hostname = SncHostname;
var CMDBHelper = GlideappCMDBHelper;
var StringUtil = GlideStringUtil;
var XMLUtil = GlideXMLUtil;
var Document = Packages.org.w3c.dom.Document;
var Probe = SncProbe;
var IPAddressUtil = GlideIPAddressUtil;

var g_array_util = new ArrayUtil();
var g_device = DeviceHistory.getFromContext();
var g_disco_functions = new DiscoveryFunctions();
var g_disco_portscan = new DiscoveryPortScanner();
