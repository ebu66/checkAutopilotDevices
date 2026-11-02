const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

/**
 * Intune に登録されている Windows デバイス (Autopilot デバイス) の一覧を取得し、ログに出力する。
 * GAS エディタから実行する。
 */
function logAutopilotDevices() {
  const devices = getAutopilotDevices_(getAccessToken_());
  console.log(`Autopilot デバイス: ${devices.length} 件`);
  devices.forEach((device) => {
    console.log([device.serialNumber, device.displayName, device.azureActiveDirectoryDeviceId].join('\t'));
  });
}

/**
 * Intune に登録されている Windows デバイス (Autopilot デバイス) の一覧を返す。
 * 必要な Graph のアクセス許可: DeviceManagementServiceConfig.Read.All (アプリケーション)
 * @param {string} accessToken
 * @return {Object[]} windowsAutopilotDeviceIdentity の配列
 */
function getAutopilotDevices_(accessToken) {
  return graphGetAll_('/deviceManagement/windowsAutopilotDeviceIdentities', accessToken);
}

/**
 * スクリプトプロパティの認証情報で Microsoft Graph のアクセストークンを取得する (クライアント資格情報フロー)。
 * @return {string}
 */
function getAccessToken_() {
  const props = PropertiesService.getScriptProperties();
  const tenantId = props.getProperty('TENANT_ID');
  const clientId = props.getProperty('CLIENT_ID');
  const clientSecret = props.getProperty('CLIENT_SECRET');
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('スクリプトプロパティ TENANT_ID / CLIENT_ID / CLIENT_SECRET を設定してください');
  }

  const response = UrlFetchApp.fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'post',
    payload: {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
    },
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() !== 200) {
    throw new Error(`アクセストークンの取得に失敗しました (HTTP ${response.getResponseCode()}): ${response.getContentText()}`);
  }
  return JSON.parse(response.getContentText()).access_token;
}

/**
 * Graph API に GET し、@odata.nextLink をたどって全ページ分の value を返す。
 * @param {string} path GRAPH_BASE_URL からの相対パス
 * @param {string} accessToken
 * @return {Object[]}
 */
function graphGetAll_(path, accessToken) {
  const items = [];
  let url = GRAPH_BASE_URL + path;
  while (url) {
    const response = UrlFetchApp.fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      muteHttpExceptions: true,
    });
    if (response.getResponseCode() !== 200) {
      throw new Error(`Graph API の呼び出しに失敗しました (HTTP ${response.getResponseCode()}): ${url}\n${response.getContentText()}`);
    }
    const body = JSON.parse(response.getContentText());
    items.push(...body.value);
    url = body['@odata.nextLink'];
  }
  return items;
}
