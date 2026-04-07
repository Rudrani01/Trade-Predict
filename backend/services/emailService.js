import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

export const sendDigestEmail = async (user, predictions) => {
  const rows = predictions
    .filter(p => p && p.advice)
    .map(({ company, advice, bullish_percentage, bearish_percentage }) => {
      const color =
        advice === 'STRONG BUY'  ? '#16a34a' :
        advice === 'BUY'         ? '#22c55e' :
        advice === 'STRONG SELL' ? '#dc2626' :
        advice === 'SELL'        ? '#ef4444' : '#f59e0b';

      return `
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:10px 8px;color:#1f2937;font-weight:500;">${company}</td>
          <td style="padding:10px 8px;font-weight:700;color:${color};">${advice}</td>
          <td style="padding:10px 8px;color:#16a34a;">${bullish_percentage.toFixed(1)}%</td>
          <td style="padding:10px 8px;color:#dc2626;">${bearish_percentage.toFixed(1)}%</td>
        </tr>`;
    }).join('');

  await transporter.sendMail({
    from: `"Trade Predict" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `📊 Trade Predict: Hourly Nifty50 Signals`,
    html: `
      <div style="font-family:sans-serif;max-width:680px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#1f2937;">Hi ${user.full_name || 'Trader'} 👋</h2>
        <p style="color:#6b7280;">Here are the latest ML signals for all Nifty50 stocks.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:12px;">COMPANY</th>
              <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:12px;">ADVICE</th>
              <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:12px;">BULLISH</th>
              <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:12px;">BEARISH</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Trade Predict — Powered by XGBoost ML</p>
      </div>
    `
  });
};