const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

/**
 * Generate an Agora RTC Token
 * @param {Request} req
 * @param {Response} res
 */
exports.generateToken = (req, res) => {
  const appId = 'YOUR_APP_ID';
  const appCertificate = 'YOUR_APP_CERTIFICATE';
  const channelName = req.query.channelName;

  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  const uid = 0; // UID for the token, typically 0 for dynamic user assignment
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // Token valid for 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    currentTimestamp + expirationTimeInSeconds
  );

  res.status(200).json({ token });
};
