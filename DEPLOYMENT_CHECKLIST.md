# Pathways Go-Live Checklist

- [ ] Supabase project created
- [ ] Schema migration 001 applied
- [ ] Seed migration 002 applied
- [ ] First admin bootstrapped
- [ ] Public email sign-up disabled if the portal is invitation-only
- [ ] Custom SMTP configured for password reset
- [ ] Netlify site deployed
- [ ] All six environment variables/secrets added correctly
- [ ] `/api/health` reports database connected
- [ ] Supabase Site URL and redirect URLs point to Netlify
- [ ] Test student account created by admin
- [ ] Student forced-password-change flow tested
- [ ] Student RLS tested: cannot see another student’s data
- [ ] Counsellor note tested and confirmed absent from student browser queries
- [ ] Admin audit log tested
- [ ] Google/Microsoft SSO enabled only if required
- [ ] Booking URL configured if using Google Appointment Schedules or Microsoft Bookings
- [ ] Backup plan reviewed
- [ ] Staff MFA enabled on hosting/database/cloud admin accounts
- [ ] Privacy, consent and data-retention rules approved
- [ ] University/TVET links reviewed for the current application cycle

## Netlify Next.js build setting

This release pins the Netlify build configuration in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `.next`
- Base directory: repository root

Do not set the publish directory to the repository root. If the Netlify UI contains an older conflicting value, this `netlify.toml` setting takes precedence, but it is still recommended to change the UI Publish directory to `.next`.

