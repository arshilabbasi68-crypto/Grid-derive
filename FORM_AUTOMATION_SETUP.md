# Form automation setup (Email + Sheets + optional WhatsApp)

This setup gives you:
- Save every consultation form submission to Google Sheets
- Instant email notification on every submission
- Optional WhatsApp alert

## 1) Create the Google Sheet

1. Create a new Google Sheet (name it `GRID Leads`).
2. In row 1, add these headers:
   - `Timestamp`
   - `Name`
   - `Business Name`
   - `Email`
   - `Phone`
   - `Source URL`
   - `Submitted At`

## 2) Create Google Apps Script

1. In the sheet, click `Extensions -> Apps Script`.
2. Replace default code with:

```javascript
function doPost(e) {
  try {
    const SHEET_NAME = 'Sheet1';
    const NOTIFY_EMAIL = 'YOUR_EMAIL@gmail.com';

    // Optional WhatsApp settings (leave blank to disable)
    const CALLMEBOT_PHONE = ''; // e.g. 919876543210
    const CALLMEBOT_API_KEY = ''; // from callmebot.com

    const data = JSON.parse(e.postData.contents || '{}');

    const name = (data.name || '').toString().trim();
    const businessName = (data.businessName || '').toString().trim();
    const email = (data.email || '').toString().trim();
    const phone = (data.phone || '').toString().trim();
    const source = (data.source || '').toString().trim();
    const submittedAt = (data.submittedAt || '').toString().trim();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    sheet.appendRow([
      new Date(),
      name,
      businessName,
      email,
      phone,
      source,
      submittedAt
    ]);

    const subject = 'New GRID&derive consultation lead';
    const body =
      'A new inquiry was submitted:\n\n' +
      'Name: ' + name + '\n' +
      'Business Name: ' + businessName + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + phone + '\n' +
      'Source URL: ' + source + '\n' +
      'Submitted At: ' + submittedAt;

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    // Optional WhatsApp message via CallMeBot
    if (CALLMEBOT_PHONE && CALLMEBOT_API_KEY) {
      const waText = encodeURIComponent(
        'New GRID lead: ' + name + ' | ' + businessName + ' | ' + email + ' | ' + phone
      );
      const waUrl =
        'https://api.callmebot.com/whatsapp.php?phone=' +
        CALLMEBOT_PHONE +
        '&text=' + waText +
        '&apikey=' +
        CALLMEBOT_API_KEY;
      UrlFetchApp.fetch(waUrl, { muteHttpExceptions: true });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Replace `YOUR_EMAIL@gmail.com` with your email.
4. Save the project.

## 3) Deploy web app

1. Click `Deploy -> New deployment`.
2. Type: `Web app`
3. Execute as: `Me`
4. Who has access: `Anyone`
5. Deploy and copy the Web App URL.

## 4) Connect your website form

Open `script.js` and replace:

`PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`

with your Web App URL.

## 5) Test

1. Fill and submit form on your page.
2. Confirm:
   - New row appears in sheet
   - Email notification is received
   - WhatsApp alert is received (if enabled)

---

If you prefer official WhatsApp Business API (Meta/Twilio) instead of CallMeBot, keep this flow and swap the WhatsApp block in Apps Script with your provider API call.
