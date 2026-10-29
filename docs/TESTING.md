# Verification and acceptance checks

Final verification passed: **18 backend checks including the isolated MySQL integration test, 2 frontend checks, and a successful production build**. The personalized PDF report was rendered and visually reviewed at eight pages.

## Automated commands

```powershell
cd backend
npm test
# Optional isolated MySQL verification (requires CREATE DATABASE privileges)
$env:RUN_MYSQL_INTEGRATION='1'
npm test
Remove-Item Env:RUN_MYSQL_INTEGRATION
cd ../frontend
npm test
npm run build
```

HTTP tests use an in-memory query stub and do not send email/SMS. The optional integration test generates and removes its own temporary database; it never uses the application database as its fixture.

| Area | Verification |
|---|---|
| Authorization | Anonymous/customers cannot create or manage tours; management listing requires admin role. |
| Create and Read | Required fields normalize correctly, the record is returned and public listing/detail reads expose it. |
| Update | The edited tour retains its ID and returns its updated title/price. |
| Delete | Booked tours are rejected; unbooked records are removed. The UI requires confirmation and permits cancellation. |
| Search/filter/sort | SQL parameters preserve search literals and duration/visibility constraints. Sorting is restricted to known expressions. |
| Booking price | Client-supplied title, route and price cannot override the saved tour. |
| Validation | Invalid email/phone/count/status values, past dates and impossible dates are rejected. Capacity includes every guest. |
| Stability | An asynchronous database error returns a sanitized JSON response rather than an unhandled rejection. |
| Database compatibility | Fresh setup works. Legacy trips with conflicting numeric IDs migrate to the correct archived tour without losing the booking. Repeated startup is safe. |

## Browser checks completed

- Published a temporary admin tour, opened its correct duration group, refreshed and verified persistence, and opened its booking page. The temporary tour was removed afterward.
- Opened the edit form for an existing package and verified values load. Cancelled without changing the real record.
- Opened and cancelled the deletion dialog.
- Searched for Ella and verified increasing prices; checked the no-results state.
- At 390px width, verified the header occupies its own space, the login heading is below it, and the page has no horizontal overflow.
- Inspected the public catalogue without console errors.

The original six package bookings were retained during the migration. Actual delivery through live SMTP/Twilio accounts and the student's camera-on demonstration video have not been tested or recorded.
