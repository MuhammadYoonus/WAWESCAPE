# Demonstration recording guide

Target duration: **4 minutes 55 seconds**, including a small buffer. Keep your camera on throughout the recording, as required by the supplied evaluation sheet. Record this yourself; the repository contains a guide, not a completed camera recording.

| Time | Show and explain |
|---|---|
| 0:00-0:20 | Introduce yourself, index number and WAWESCAPE. State that tours are the main CRUD entity. |
| 0:20-0:50 | Show the architecture and ERD. Explain React, Express, MySQL and the user/tour/booking relationships. |
| 0:50-1:20 | Search public packages by location, change duration and sort by price. Open a package and show its itinerary. |
| 1:20-2:00 | Log in as admin. Add an unbooked demonstration tour with a unique name, route, duration, price, image URL, guest limit and plan. |
| 2:00-2:30 | Follow the publication link. Refresh the public page to demonstrate persistent database storage. |
| 2:30-3:05 | Edit that tour's title or price. Show the public catalogue displaying the same record with the new details. |
| 3:05-3:35 | Open Delete, explain the confirmation, then remove your unbooked demonstration tour. Refresh and show it is absent. Explain that tours with bookings are protected. |
| 3:35-4:05 | Show required-field/date validation and guest limits. Explain that the server calculates the trusted price. |
| 4:05-4:40 | Show test results, database keys and Git history. Explain that failed requests receive useful messages and retry controls. |
| 4:40-4:55 | Briefly recap the demonstrated CRUD workflow and conclude. |

## Preparation

1. Start MySQL, backend and frontend using the README.
2. Run tests and the frontend build before recording.
3. Use a fresh, clearly labeled demonstration tour. Only delete the unbooked record you created for the demonstration.
4. A bundled image can use `/tour-images/Weligama%20beach.jpeg`; alternatively provide a working HTTPS image URL.
5. Use a future date if demonstrating booking entry. A real booking may trigger configured email/SMS services; do not submit one unless you intend those notifications.
6. Keep terminals readable. Do not display `.env`, passwords, tokens or existing customers' contact details in the recording.
7. Check the final recording duration and that your camera is visible before submission.

## Submission checklist from the supplied evaluation sheet

- Submit the GitHub repository link using the lecturer's designated sheet.
- Personalize the report cover, keep the PDF at **10 pages or fewer**, and use your index number in its filename.
- Record a camera-on video of **5 minutes or less**, using your index number in its filename.
- The supplied sheet gives a deadline of **31 October 2026**. Submission itself has not been performed by this task.

The report cover uses MBM Yoonus, EG/2023/5990. Review the report and record the demonstration before submitting. Use `EG_2023_5990_Demonstration.mp4` as a filesystem-safe video filename.
