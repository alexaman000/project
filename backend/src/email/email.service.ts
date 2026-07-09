import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Sends a reminder email to the user with beautiful HTML template.
   */
  async sendReminderEmail(params: {
    to: string;
    taskTitle: string;
    description: string;
    priority: string;
    category: string;
    dueDateTime: Date | null;
    reminderBeforeMinutes: number;
  }): Promise<boolean> {
    const { to, taskTitle, description, priority, category, dueDateTime, reminderBeforeMinutes } = params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const dueDateStr = dueDateTime
      ? dueDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Not set';
    const dueTimeStr = dueDateTime
      ? dueDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : 'Not set';

    const reminderNote =
      reminderBeforeMinutes > 0
        ? `This reminder was sent ${reminderBeforeMinutes} minutes before the task is due.`
        : 'This is your reminder for the task at the exact time.';

    const priorityColor =
      priority === 'High' ? '#ef4444' : priority === 'Medium' ? '#f59e0b' : '#22c55e';

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Task Reminder</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">🔔</div>
              <h1 style="color:#fff;font-size:26px;margin:0;font-weight:700;letter-spacing:-0.5px;">Task Reminder</h1>
              <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">${reminderNote}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#1e293b;padding:36px 40px;">

              <!-- Task Card -->
              <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:28px;margin-bottom:28px;">
                <div style="display:flex;align-items:center;margin-bottom:20px;">
                  <span style="background:${priorityColor};color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">${priority}</span>
                  <span style="margin-left:10px;background:#1e293b;border:1px solid #334155;color:#94a3b8;font-size:11px;padding:4px 10px;border-radius:20px;">${category || 'General'}</span>
                </div>

                <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 12px;font-weight:600;">${taskTitle}</h2>
                ${description ? `<p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">${description}</p>` : ''}

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="padding:0 10px 0 0;">
                      <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:14px;">
                        <div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">📅 Due Date</div>
                        <div style="color:#e2e8f0;font-size:14px;font-weight:500;">${dueDateStr}</div>
                      </div>
                    </td>
                    <td width="50%" style="padding:0 0 0 10px;">
                      <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:14px;">
                        <div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">⏰ Due Time</div>
                        <div style="color:#e2e8f0;font-size:14px;font-weight:500;">${dueTimeStr}</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${frontendUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                  Open Dashboard →
                </a>
              </div>

              <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">
                Have a productive day! 🚀<br/>
                <em>This is an automated reminder from your Todo App.</em>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
              <p style="color:#334155;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Todo App · You are receiving this because you enabled reminders.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    try {
      await this.transporter.sendMail({
        from: `"Todo Reminders" <${process.env.EMAIL_FROM}>`,
        to,
        subject: `⏰ Reminder: ${taskTitle}`,
        html: htmlBody,
      });
      this.logger.log(`Reminder email sent to ${to} for task: ${taskTitle}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send reminder email to ${to}:`, error.message);
      return false;
    }
  }
}
