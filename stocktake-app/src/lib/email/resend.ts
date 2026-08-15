import { Resend } from 'resend'
import type { Dept, Branch, StockItem } from '@/types'
import { DEPT_MAP, BRANCH_MAP } from '@/lib/constants'

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder')

const FROM_EMAIL = 'stocktake@becoolcouriers.com.au'

export async function sendDeptNotification(
  item: StockItem,
  dept: Dept,
  note: string,
  assignedByName: string
) {
  const deptInfo = DEPT_MAP[dept]
  const branchLabel = BRANCH_MAP[item.branch]

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e40af; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 18px;">BC Stocktake — Action Required</h1>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">${deptInfo.label} Team · ${branchLabel}</p>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 140px;">Consignment</td>
            <td style="padding: 8px 0; font-weight: 600;">${item.tracking || item.serial || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Client</td>
            <td style="padding: 8px 0;">${item.client || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Branch</td>
            <td style="padding: 8px 0;">${branchLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Depot</td>
            <td style="padding: 8px 0;">${item.delivery_depot || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Status Code</td>
            <td style="padding: 8px 0;">${item.status_code || '—'}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; background: #fff; border-left: 4px solid #1e40af; padding: 12px 16px; border-radius: 0 4px 4px 0;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Action Required</p>
          <p style="margin: 0; font-size: 15px;">${note}</p>
        </div>
        <p style="margin-top: 16px; font-size: 13px; color: #94a3b8;">Assigned by ${assignedByName}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/item/${item.id}"
           style="display: inline-block; margin-top: 8px; background: #1e40af; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">
          View Item →
        </a>
      </div>
    </div>
  `

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: [deptInfo.email],
    subject: `[${item.branch}] Action Required — ${item.client || item.tracking || item.serial || 'Item'}`,
    html,
  })
}

export async function sendBulkDeptDigest(
  items: StockItem[],
  dept: Dept,
  sentByName: string
) {
  const deptInfo = DEPT_MAP[dept]

  const rows = items.map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 8px; font-size: 13px;">${BRANCH_MAP[item.branch]}</td>
      <td style="padding: 10px 8px; font-size: 13px;">${item.tracking || item.serial || '—'}</td>
      <td style="padding: 10px 8px; font-size: 13px;">${item.client || '—'}</td>
      <td style="padding: 10px 8px; font-size: 13px;">${item.status_code || '—'}</td>
      <td style="padding: 10px 8px; font-size: 13px;">${item.action_required || '—'}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="background: #1e40af; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 18px;">BC Stocktake — ${deptInfo.label} Digest</h1>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">${items.length} pending item${items.length !== 1 ? 's' : ''} · Sent by ${sentByName}</p>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #e2e8f0;">
              <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #64748b;">Branch</th>
              <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #64748b;">Consignment</th>
              <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #64748b;">Client</th>
              <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #64748b;">Code</th>
              <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #64748b;">Action Required</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}"
           style="display: inline-block; margin-top: 20px; background: #1e40af; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">
          Open Dashboard →
        </a>
      </div>
    </div>
  `

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: [deptInfo.email],
    subject: `[Stocktake Digest] ${items.length} pending item${items.length !== 1 ? 's' : ''} for ${deptInfo.label}`,
    html,
  })
}
