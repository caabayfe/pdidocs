/**
 * Expose the SSHProviderTerminal Java API
 */

var SSHProviderTerminal = Packages.com.snc.sw.providers.SSHProviderTerminal;
var DiscoveryProviderFactory = Packages.com.snc.sw.providers.DiscoveryProviderFactory;
var ProviderType = Packages.com.snc.sw.dto.ProviderType;
var AuthenticationFailureException = Packages.com.snc.sw.exception.AuthenticationFailureException;
/**
 * Java imports
 */
var URL = Packages.java.net.URL;
var HashMap = Packages.java.util.HashMap;
var Map = Packages.java.util.Map;
var List = Packages.java.util.List;
var ArrayList = Packages.java.util.ArrayList;

/**
 * Service-now.com imports
 */
var MIDServer = Packages.com.service_now.mid.MIDServer;
var Credential = Packages.com.snc.automation_common.integration.creds.Credential;
var CredentialType = Packages.com.snc.automation_common.integration.creds.CredentialType;
var MIDScript = Packages.com.service_now.mid.script.MIDScript;
var MIDScriptType = Packages.com.service_now.mid.script.MIDScriptType;
var IPAddressUtil = Packages.com.glide.util.IPAddressUtil;
var SOURCE = Packages.com.glide.util.IConstants.SOURCE;
var escape = Packages.com.glide.util.StringUtil.escapeTitle;
var nil = Packages.com.glide.util.StringUtil.nil;
