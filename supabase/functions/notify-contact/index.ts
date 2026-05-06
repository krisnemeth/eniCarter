// Supabase Edge Function — notify-contact
//
// Sends an email via Resend whenever a contact form is submitted.
//
// Setup (run once in your terminal):
//   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
//   supabase secrets set CONTACT_TO_EMAIL=enitatts@gmail.com
//   supabase secrets set CONTACT_FROM_EMAIL=noreply@yourdomain.com
//
// The FROM address must be from a domain you have verified in Resend.
// During development you can use Resend's shared domain:
//   onboarding@resend.dev  (only delivers to your own verified email)
//
// Deploy with:
//   supabase functions deploy notify-contact

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { name, email, message } = await req.json() as {
      name: string
      email: string
      message: string
    }

    const apiKey = Deno.env.get('RESEND_API_KEY')
    const toEmail = Deno.env.get('CONTACT_TO_EMAIL')
    const fromEmail = Deno.env.get('CONTACT_FROM_EMAIL') ?? 'onboarding@resend.dev'

    if (!apiKey || !toEmail) {
      console.error('Missing RESEND_API_KEY or CONTACT_TO_EMAIL secret')
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `Új üzenet az oldaladról – ${name}`,
        html: `
          <p><strong>Név:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Üzenet:</strong></p>
          <p style="white-space:pre-wrap">${message}</p>
        `,
        text: `Név: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('Resend error:', res.status, body)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('notify-contact error:', err)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
