import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPredictionEmail = async (to, company, prediction) => {
  const { advice, bullish_percentage, bearish_percentage } = prediction;

  const adviceColor = 
    advice === 'STRONG BUY' ? '#16a34a' :
    advice === 'BUY' ? '#22c55e' :
    advice === 'STRONG SELL' ? '#dc2626' :
    advice === 'SELL' ? '#ef4444' : '#f59e0b';

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject: `📈 Trade Predict: ${company} — ${advice}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#1f2937;">Trade Predict — Daily Signal</h2>
        <p style="color:#6b7280;">Here's today's ML prediction for <strong>${company}</strong></p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0;font-size:24px;font-weight:700;color:${adviceColor};">${advice}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px;color:#6b7280;">Bullish</td>
            <td style="padding:8px;font-weight:600;color:#16a34a;">${bullish_percentage.toFixed(2)}%</td>
          </tr>
          <tr>
            <td style="padding:8px;color:#6b7280;">Bearish</td>
            <td style="padding:8px;font-weight:600;color:#dc2626;">${bearish_percentage.toFixed(2)}%</td>
          </tr>
        </table>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Trade Predict — Powered by XGBoost ML</p>
      </div>
    `
  });
};