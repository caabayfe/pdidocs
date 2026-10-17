/*
 * the vendor prefix is fetched from java code and stored
 * in the scratch pad so that it is available other scripts
 * such as the client script, "Normalize Table Name".
 */
g_scratchpad.vendorPrefix = SNC.Apps.getDatabasePrefixForUser();
