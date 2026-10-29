"""Rebuild the project report and ERD with reportlab (see requirements-report.txt)."""
from pathlib import Path
import json
import re
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle, KeepTogether
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
DETAILS = json.loads((ROOT / "student-details.json").read_text(encoding="utf-8"))
PREFIX = re.sub(r"[^A-Za-z0-9]+", "_", DETAILS["index"]).strip("_")
TEAL = colors.HexColor("#005F73")
INK = colors.HexColor("#183F49")
GOLD = colors.HexColor("#EE9B00")
LIGHT = colors.HexColor("#EDF6F6")

def diagram(filename):
    c = canvas.Canvas(str(filename), pagesize=A4)
    c.setTitle("WAWESCAPE database ERD")
    c.setFillColor(TEAL); c.setFont("Helvetica-Bold", 20)
    c.drawString(30, 805, "WAWESCAPE | Database ERD")
    c.setFillColor(INK); c.setFont("Helvetica", 10)
    c.drawString(30, 786, "Primary and foreign keys for the main application entities")

    def card(x, top, title, fields):
        height = 39 + 16 * len(fields)
        c.setFillColor(colors.white); c.setStrokeColor(TEAL)
        c.roundRect(x, top-height, 250, height, 7, fill=1, stroke=1)
        c.setFillColor(TEAL); c.roundRect(x, top-29, 250, 29, 7, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 11)
        c.drawString(x+12, top-19, title)
        c.setFillColor(INK); c.setFont("Helvetica", 9)
        for index, field in enumerate(fields): c.drawString(x+12, top-47-index*16, field)

    card(30,760,"users",["PK  id : INT", "name : VARCHAR(120)", "UK  email : VARCHAR(180)", "password : VARCHAR(255), bcrypt hash", "role : customer / admin", "created_at, updated_at : TIMESTAMP"])
    card(315,760,"tours",["PK  id : INT", "UK  slug : VARCHAR(180)", "title, category, location, duration", "price : DECIMAL(10,2)", "max_guests : INT", "image, description : TEXT", "itinerary : JSON", "featured, active : BOOLEAN"])
    card(30,500,"bookings",["PK  id : INT", "FK  user_id -> users.id (nullable)", "FK  tour_id -> tours.id", "booking_date : DATE", "guests, adults, children, infants : INT", "total_price : DECIMAL(10,2)", "contact_phone, pickup_location", "special_requests : TEXT; status : ENUM"])
    card(315,500,"package_bookings",["PK  id : INT", "FK  user_id -> users.id", "FK  tour_id -> tours.id (legacy nullable)", "package_id, title, route, price snapshots", "booking_date : DATE", "guests, adults, children, infants : INT", "total_amount : DECIMAL(10,2)", "contact details, special_requests, status"])
    card(30,240,"inquiries",["PK  id : INT", "name, email, tour_interest : VARCHAR", "message : TEXT", "status : new / contacted / closed", "created_at, updated_at : TIMESTAMP"])
    card(315,240,"feedback",["PK  id : INT", "name, email, trip : VARCHAR", "rating : INT (1-5)", "message : TEXT", "status : new / reviewed / hidden"])

    def arrow(points, color, label, label_pos):
        c.setStrokeColor(color); c.setLineWidth(1.5)
        path = c.beginPath(); path.moveTo(*points[0])
        for point in points[1:]: path.lineTo(*point)
        c.drawPath(path)
        x,y = points[-1]
        c.setFillColor(color)
        head = c.beginPath(); head.moveTo(x,y); head.lineTo(x-4,y+8); head.lineTo(x+4,y+8); head.close()
        c.drawPath(head, fill=1, stroke=0)
        c.setFont("Helvetica-Bold",9); c.drawString(*label_pos,label)
    arrow([(150,625),(150,500)],TEAL,"1 : many",(90,555))
    arrow([(440,593),(440,500)],GOLD,"1 : many",(451,552))
    arrow([(250,625),(290,625),(290,542),(390,542),(390,500)],TEAL,"user",(345,548))
    arrow([(330,593),(303,593),(303,526),(210,526),(210,500)],GOLD,"tour",(230,532))
    c.setFillColor(INK); c.setFont("Helvetica",9)
    c.drawString(30,88,"PK = primary key; UK = unique key; FK = foreign key. Selected fields are shown.")
    c.drawString(30,72,"Tour deletion is restricted when bookings exist. Hiding a tour retains its history.")
    c.drawString(30,56,"Legacy trips/columns are retained for compatibility; schema_migrations tracks imports.")
    c.save()

STYLES = getSampleStyleSheet()
STYLES.add(ParagraphStyle(name="TitleBrand",fontName="Helvetica-Bold",fontSize=30,leading=35,textColor=TEAL,spaceAfter=18))
STYLES.add(ParagraphStyle(name="SectionBrand",fontName="Helvetica-Bold",fontSize=17,leading=21,textColor=TEAL,spaceAfter=12))
STYLES.add(ParagraphStyle(name="BodyBrand",fontName="Helvetica",fontSize=10,leading=14,textColor=INK,spaceAfter=9))
STYLES.add(ParagraphStyle(name="SmallBrand",fontName="Helvetica",fontSize=8.5,leading=11.5,textColor=INK,spaceAfter=7))
STYLES.add(ParagraphStyle(name="CaptionBrand",fontName="Helvetica-Oblique",fontSize=8.5,leading=11,textColor=INK,spaceAfter=10))

def p(text,style="BodyBrand"): return Paragraph(text,STYLES[style])
def heading(text): return p(text,"SectionBrand")
def table(headers,rows,widths):
    data=[[p(cell,"SmallBrand") for cell in row] for row in [headers]+rows]
    result=Table(data,colWidths=widths,hAlign="LEFT",repeatRows=1)
    result.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),LIGHT),("VALIGN",(0,0),(-1,-1),"TOP"),("LINEBELOW",(0,0),(-1,0),1,TEAL),("LINEBELOW",(0,1),(-1,-1),.35,colors.HexColor("#C9DDDF")),("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    return result
def shot(filename,width=505):
    from PIL import Image as PILImage
    path=ROOT/"screenshots"/filename
    with PILImage.open(path) as im: height=width*im.height/im.width
    return Image(str(path),width=width,height=height)

def footer(c,doc):
    c.saveState(); c.setStrokeColor(TEAL); c.line(40,810,555,810)
    c.setFillColor(TEAL); c.setFont("Helvetica-Bold",8); c.drawString(40,819,"WAWESCAPE | EC4307 Web Application Development")
    c.setFillColor(INK); c.setFont("Helvetica",8); c.drawString(40,24,DETAILS["index"]); c.drawRightString(555,24,f"Page {doc.page}"); c.restoreState()

def build():
    diagram(ROOT/"WAWESCAPE_ERD.pdf")
    story=[]
    story += [Spacer(1,65),p("WAWESCAPE","TitleBrand"),heading("Tour Agency Web Application"),p("Mini Project Report"),Spacer(1,25),table(["Student","Index number"],[[DETAILS["students"],DETAILS["index"]]],[310,195]),Spacer(1,25),p("<b>Project overview</b>"),p("WAWESCAPE is a full-stack Sri Lankan tour agency application. Customers browse and search tour packages, review itineraries, save favorites and request bookings. Administrators create, list, update and safely delete tour records stored persistently in MySQL."),p("The main assessed entity is the <b>tour</b>. The application demonstrates a complete form-based CRUD workflow, relational booking records, client and server validation, responsive navigation, reusable components and Git version history."),p('Repository: <link href="https://github.com/MuhammadYoonus/WAWESCAPE" color="#005F73">github.com/MuhammadYoonus/WAWESCAPE</link>'),p("Course: EC4307 Web Application Development. This report contains eight pages, including the cover."),PageBreak()]

    story += [heading("1. Requirements and architecture"),p("The application supports two roles. Customers can read published packages and submit authenticated booking requests; administrators manage tour packages and booking, inquiry and feedback statuses. Administrative API operations check the signed user's role."),table(["Layer","Implementation and responsibility"],[["Client","React, React Router and Tailwind CSS. Pages and reusable components provide forms, catalogue views, navigation, loading states and feedback."],["HTTP API","Express/Node.js exposes REST endpoints. JWT middleware enforces authentication and admin authorization. Parameterized SQL queries access MySQL."],["Persistence","MySQL stores users, tours, both booking types, inquiries and feedback. Startup migrations create required structures and preserve older records."],["Optional notifications","SMTP and Twilio adapters can send confirmations when configured. Missing credentials skip those channels during local development."]],[95,410]),Spacer(1,18),heading("Main API operations"),table(["Operation","Endpoint","Behavior"],[["Create","POST /api/tours","Admin form creates a validated tour."],["Read","GET /api/tours","Lists public tours with search, filters and sorting."],["Read details","GET /api/tours/:id","Returns a published tour and itinerary."],["Update","PUT /api/tours/:id","Admin edits the existing tour record."],["Delete","DELETE /api/tours/:id","Removes an unbooked tour; rejects booked tours."],["Book","POST /api/package-bookings","Uses the stored tour price and capacity."]],[80,170,255]),Spacer(1,12),p("Flow: browser form -> authenticated HTTP request -> server validation -> parameterized SQL -> MySQL -> JSON response -> visible confirmation or error."),PageBreak()]

    story += [heading("2. Database design"),p("Primary/unique keys identify users and tours. Foreign keys connect bookings to the correct user and tour. Prices and totals use DECIMAL(10,2); dates use DATE and itineraries use JSON.","SmallBrand")]
    erd_png=ROOT/"screenshots"/"erd.png"
    if not erd_png.exists():
        import subprocess, shutil
        poppler=shutil.which("pdftoppm")
        if not poppler: raise RuntimeError("pdftoppm is needed to render the ERD for the report")
        subprocess.run([poppler,"-png","-singlefile","-scale-to","1800",str(ROOT/"WAWESCAPE_ERD.pdf"),str(erd_png.with_suffix(""))],check=True)
    story += [Image(str(erd_png),width=445,height=445*A4[1]/A4[0]),p("Package bookings retain price/title snapshots for history. Legacy trip IDs are migrated through explicit relationships, rather than assuming matching numeric IDs identify the same tour.","SmallBrand"),PageBreak()]

    story += [heading("3. Create and Read"),p("The admin form accepts a name, route, duration, price, guest limit, image, descriptions and itinerary. Saving inserts a tour in MySQL and provides a link to its public duration group. Public reads support name/location/description searches and approved price/name/newest sorting."),shot("package-search.png"),p("Figure 1. Public database catalogue with search and sorting.","CaptionBrand"),shot("tour-editor.png",440),p("Figure 2. Shared tour form with package preview; creation and editing use the same validated fields.","CaptionBrand"),PageBreak()]

    story += [heading("4. Update and safe Delete"),p("Administrators select Edit to load a tour into the form. Saving updates the same ID; subsequent public reads use the updated record. Visibility can be disabled to prevent new bookings without removing history. All original starter packages are imported into MySQL once and can be managed through this workflow."),shot("tour-management.png"),p("Figure 3. Administrative tour listing and management controls.","CaptionBrand"),shot("delete-confirmation.png",440),p("Figure 4. Explicit confirmation before permanent deletion. API checks and foreign keys reject deletion of tours referenced by bookings.","CaptionBrand"),PageBreak()]

    story += [heading("5. Validation, errors and responsive UI"),table(["Input or event","Handling"],[["Contact fields","Required text is trimmed and bounded. Emails and phone numbers are validated by the server."],["Travel date","Real calendar date, today or later in Sri Lanka. Past or impossible dates are rejected."],["Guests and prices","Whole nonnegative guest counts, at least one adult, total capacity check and a positive stored price. Client-supplied booking prices are ignored."],["Statuses and roles","Only allowed status values are accepted. Management routes require an authenticated admin."],["Request failures","Sanitized JSON errors, visible messages and retry controls. Expired sessions are cleared; invalid local session data cannot crash startup."],["Mobile and keyboard use","Collapsed navigation menu, sticky header in document flow, readable contrast, keyboard focus indicators and contained deletion-dialog focus."]],[120,385]),Spacer(1,12),shot("mobile-login.png",180),p("Figure 5. Mobile login page at 390px width; navigation no longer overlaps the heading.","CaptionBrand"),PageBreak()]

    story += [heading("6. Setup and verification"),p("Install Node.js 20 or later and MySQL, create the wavescape_db database, then copy backend/.env.example to backend/.env and set database credentials and a JWT secret. Run npm ci, npm run seed and npm run dev in backend. Run npm ci and npm run dev in frontend. The normal ports are 5001 for the API and 5173 for the client."),p("Startup creates required tables, imports starter packages once and upgrades legacy booking structures. Re-running seed does not clear bookings or overwrite existing tour edits. Bundled catalogue images are served by the API's /tour-images route."),table(["Check","Evidence"],[["Automated HTTP checks","Role access, publishing, public reads, editing, booked-tour protection, trusted booking price/capacity and sanitized asynchronous failures."],["Validation/query checks","Dates, contacts, guest counts and status constraints; search wildcard escaping and sort-expression allowlisting."],["Isolated MySQL check","Fresh setup and repeatable legacy migration, including a trip whose numeric ID conflicts with a different current tour."],["Frontend checks/build","Package conversion and price formatting tests; Vite production build succeeds."],["Browser verification","Temporary tour publication and persistence after refresh, booking-page details, edit loading, delete cancellation, search/price sorting, empty results and mobile layout."]],[135,370]),Spacer(1,14),p("The migration retained the six existing package bookings. Browser screenshots deliberately show catalogue and management controls rather than customer contact records."),p("Commands and detailed acceptance steps are in docs/TESTING.md. The optional MySQL test creates and removes a generated temporary database; ordinary HTTP tests use an isolated query stub and disable notifications."),p("Live SMTP/Twilio delivery and the student's camera-on demonstration recording are outside the completed verification."),PageBreak()]

    story += [heading("7. Evaluation coverage and demonstration"),table(["Criterion","Marks","Application evidence"],[["Create","4","Admin tour form persists records in MySQL."],["Read","4","Catalogue, details, search, duration/visibility filters and sorting."],["Update","4","Admin edits the same tour record."],["Delete","4","Confirmation and protection of booked tours."],["Validation/errors","2","Client constraints, server validation and visible failures."],["Database design","4","Keys, relationships, suitable types and compatibility migrations."],["UI/UX/mobile","2","Consistent navigation, responsive menu and readable forms."],["Code quality","2","Reusable components/utilities, route separation and Git history."],["Documentation","2","README, setup, ERD, screenshots, testing guide and this report."],["Demonstration","2","Timed guide prepared; student must record and present."]],[115,40,350]),Spacer(1,14),p("The rubric's full CRUD requirement is addressed through tours as one persistent main entity. This table maps evidence to the assessment categories; it is not a promise of marks."),p("The accompanying demonstration guide targets 4 minutes 55 seconds: introduce the application, show the ERD, search and sort tours, create a demonstration package, refresh it, edit it, demonstrate safe deletion, and explain validation and tests."),p("Before submission, review this report, record the camera-on video, confirm the recording is no longer than five minutes and submit the repository link through the lecturer's designated process. The supplied evaluation sheet states a deadline of 31 October 2026."),p("Report author: "+DETAILS["students"]+" | "+DETAILS["index"]),p("Supporting files: README.md; docs/ERD.md; docs/TESTING.md; docs/DEMONSTRATION_GUIDE.md; backend/src/db.js; backend/src/routes/; backend/test/; frontend/src/; frontend/test/.","SmallBrand")]

    target=ROOT/f"{PREFIX}_Project_Report.pdf"
    doc=SimpleDocTemplate(str(target),pagesize=A4,rightMargin=40,leftMargin=40,topMargin=48,bottomMargin=40,title="WAWESCAPE Mini Project Report",author=DETAILS["students"])
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    from pypdf import PdfReader
    pages=len(PdfReader(target).pages)
    if pages>10: raise RuntimeError(f"Report exceeds rubric limit: {pages} pages")
    print(f"Created {target.name}: {pages} pages")

if __name__=="__main__": build()
