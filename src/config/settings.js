export default {
  apikey: process.env.API_APIKEY,
  secret: process.env.API_SECRET,
  loginurl: `${process.env.VEEPAY_URL_BASE}/login`,
  paymentUrl: `${process.env.VEEPAY_URL_BASE}/api/payment`,
  infobipSmsUrl: process.env.INFO_BI_SMS_URL,
  infobipUser: process.env.INFO_BI_SMS_USER,
  infobipPass: process.env.INFO_BI_SMS_PASSWORD,
};
