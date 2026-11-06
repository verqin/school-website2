// Dashboard user manuals. Shown inside each dashboard and exported to Files.
// Typography law: plain hyphens only.

export type ManualProcess = { title: string; steps: string[] };
export type ManualPage = {
  name: string;
  path: string;
  purpose: string;
  features: string[];
  buttons: [string, string][];
  processes: ManualProcess[];
  tips?: string[];
};
export type Manual = { id: string; title: string; audience: string; intro: string; access: string[]; pages: ManualPage[] };

// Shared behaviour for the standard section pages (add, edit, search, export).
const standardButtons: [string, string][] = [
  ["Add record", "Opens a form to create a new entry. Required fields are marked; Save stores it, Cancel closes without saving."],
  ["Search box", "Filters the table as you type, across every visible column."],
  ["Edit (pencil)", "Opens the selected row in the same form so you can correct it, then Save."],
  ["Delete (bin)", "Removes the row after you confirm. Only administrators can delete; others see the button disabled."],
  ["Export CSV", "Downloads the rows currently shown (after search) as a spreadsheet file."],
  ["Related links", "Shortcut buttons to connected pages, for example Payments from Finance."],
];
const standardProcesses = (thing: string): ManualProcess[] => [
  { title: `Add a new ${thing}`, steps: ["Click Add record.", "Fill in every required field.", "Click Save. A green message confirms it and the row appears at the top of the table."] },
  { title: `Correct a ${thing}`, steps: ["Type a name or code in the search box.", "Click the pencil on the row.", "Change the fields and click Save."] },
  { title: `Download a list of ${thing}s`, steps: ["Optionally narrow the table with the search box.", "Click Export CSV.", "Open the file in Excel or Google Sheets."] },
];
const section = (name: string, path: string, purpose: string, thing: string, features: string[], extra: ManualProcess[] = []): ManualPage => ({
  name, path, purpose,
  features: ["Counters at the top showing real totals from the school records.", ...features, "A short how-to box explaining the page."],
  buttons: standardButtons,
  processes: [...standardProcesses(thing), ...extra],
});

export const adminManual: Manual = {
  id: "admin",
  title: "Staff dashboard manual",
  audience: "Administrators, principal, admissions, finance and office staff",
  intro: "The staff dashboard is where the school is run: admissions, students, money, messages, academics and daily operations. Every page only shows what your role allows.",
  access: [
    "Open the website and go to /admin, or use the hidden footer shortcut: click the crest 7 times, then enter the two codes.",
    "On the Staff sign in card enter your school email and password, then click Sign in.",
    "New staff: register with your school email, then ask an administrator to give you a role. Until then the dashboard stays locked.",
    "The top bar has a Jump to a section box: type a page name (for example Payments) and press Enter.",
    "Signed in as shows your email under the menu. Use Sign out when you leave a shared computer.",
  ],
  pages: [
    {
      name: "Content (dashboard home)", path: "/admin",
      purpose: "Start page with admissions counters and website content management (news, events, gallery, staff profiles).",
      features: ["Counters: total applications, under review, accepted, waitlisted, documents waiting to be checked.", "Unread messages tile.", "Lists of news posts, events, gallery albums and staff profiles."],
      buttons: [["New post / New event / New album / New profile", "Opens the editor for that content type."], ["Publish toggle", "Makes the item visible on the public website; off keeps it as a draft."], ["Edit / Delete", "Change or remove an item."]],
      processes: [
        { title: "Publish a news article", steps: ["Click New post.", "Enter a title, short summary, the article text and a cover image.", "Switch Publish on.", "Click Save. It now shows on the News page and the home page."] },
        { title: "Add an event", steps: ["Click New event.", "Enter title, date, time, place and description.", "Switch Publish on and Save. It appears on the Events page in date order."] },
        { title: "Add gallery photos", steps: ["Click New album and give it a title.", "Upload the photos and add a caption to each.", "Publish and Save."] },
      ],
    },
    {
      name: "Admissions", path: "/admin/admissions",
      purpose: "Command centre for every application sent from the Register Now form.",
      features: ["Search by name or reference (CRA-...).", "Filters by status, intake and grade.", "Each row opens the full application."],
      buttons: [["Export CSV", "Downloads the filtered applications."], ["Open (row)", "Opens the application review page."]],
      processes: [{ title: "Find an application", steps: ["Type the reference number or child's name.", "Or pick a status filter such as Submitted.", "Click the row to open it."] }],
    },
    {
      name: "Application review", path: "/admin/admissions/:id",
      purpose: "Everything about one applicant: details, uploaded documents, notes, interview and decision.",
      features: ["Student and guardian details.", "Uploaded documents with a Pending / Verified / Rejected state.", "Internal notes visible only to staff.", "Audit trail of every change with name and time."],
      buttons: [["Change status", "Moves the application: Under review, Documents requested, Interview scheduled, Interviewed, Accepted, Waitlisted, Not offered."], ["Request documents", "Records which documents the family must bring or upload."], ["Schedule interview", "Sets date, time and place."], ["Verify / Reject (document)", "Marks an uploaded file after checking it."], ["Assign", "Gives the application to a colleague."], ["Add note", "Saves an internal comment."], ["Enroll", "For accepted applicants: creates the student record (safe to press twice, it never duplicates)."]],
      processes: [
        { title: "Take an application from received to enrolled", steps: ["Open the application and set status to Under review.", "Check documents; click Verify on each correct one, Reject with a reason otherwise.", "If something is missing click Request documents and choose the items.", "Click Schedule interview, set the date and Save. Afterwards set status to Interviewed.", "Set status to Accepted (or Waitlisted / Not offered).", "Click Enroll. The child now appears under Students."] },
      ],
      tips: ["The family sees the new status when they track with their reference and email."],
    },
    {
      name: "Admissions setup", path: "/admin/admissions/settings",
      purpose: "Controls what the public Admissions page and application form show.",
      features: ["Intakes (open and close dates, application fee, instructions).", "Entry requirements and required documents.", "Grades accepting applications."],
      buttons: [["Add intake / Edit", "Create or change an intake."], ["Active toggle", "Only active intakes accept applications."], ["Add requirement", "Adds a document or step; tick Mandatory if required."]],
      processes: [{ title: "Open a new intake", steps: ["Click Add intake.", "Enter the name (for example 2028 intake), opening and closing dates and fee.", "Write instructions for families.", "Switch Active on and Save. It appears on the Admissions page and in the form."] }],
    },
    {
      name: "Students", path: "/admin/students",
      purpose: "Register of every enrolled learner.",
      features: ["Search by name or student number.", "Class, status and guardian shown per student."],
      buttons: standardButtons,
      processes: [...standardProcesses("student"), { title: "Link a parent to a student", steps: ["Open the student with Edit.", "Under guardians enter the parent's email (they must have registered).", "Save. The parent now sees this child in the Parent portal."] }],
    },
    {
      name: "Finance", path: "/admin/finance",
      purpose: "Fee invoices and balances for each student.",
      features: ["Totals invoiced, paid and outstanding.", "Invoice list with status."],
      buttons: [...standardButtons, ["Outstanding fees", "Opens the list of unpaid balances."]],
      processes: [{ title: "Raise an invoice", steps: ["Click Add record.", "Choose the student, term and fee item, enter the amount and due date.", "Save. The parent sees it in their portal."] }, { title: "Correct an invoice", steps: ["Never delete a sent invoice.", "Add an adjustment (credit or debit) with a reason. Adjustments cannot be edited afterwards, which keeps the record honest."] }],
    },
    {
      name: "Payments", path: "/admin/finance/payments",
      purpose: "Record money received and issue receipts.",
      features: ["Payment list with method, reference and date."],
      buttons: standardButtons,
      processes: [{ title: "Record a payment", steps: ["Click Add record.", "Pick the student and the invoice being paid.", "Enter amount, method (cash, bank, EcoCash, card) and the bank or receipt reference.", "Save. The balance updates and a receipt number is created."] }],
    },
    section("Outstanding fees", "/admin/finance/outstanding", "Unpaid balances to follow up with families.", "balance", ["Sorted by amount owed."], [{ title: "Follow up a debtor", steps: ["Search the student.", "Export CSV to share with the bursar, or edit the row to add a follow-up note and date."] }]),
    {
      name: "Messages", path: "/admin/messages",
      purpose: "Every message sent from the website Contact page.",
      features: ["New badge on unread messages and a count of open ones."],
      buttons: [["Reply by email", "Opens your email program addressed to the sender."], ["Mark handled / Reopen", "Closes or reopens the message."]],
      processes: [{ title: "Answer a website enquiry", steps: ["Open Messages from the top menu.", "Read the message marked New.", "Click Reply by email and send your answer.", "Click Mark handled so colleagues know it is done."] }],
    },
    section("Academics", "/admin/academics", "Subjects, classes, terms and academic structure.", "subject or class", ["Links to Assessments, Report cards and Analytics."]),
    section("Assessments", "/admin/academics/assessments", "Tests, assignments and exams with their maximum marks.", "assessment", ["Marks above the total are rejected automatically."]),
    section("Report cards", "/admin/academics/report-cards", "Term reports per student.", "report card", ["Draft, Ready and Published states."], [{ title: "Publish report cards", steps: ["Check teachers have entered marks and comments.", "Edit each report and set status to Published.", "Parents can then see it in their portal."] }]),
    section("Academic analytics", "/admin/academics/analytics", "Averages and trends by class and subject.", "analytics entry", []),
    section("Attendance", "/admin/attendance", "Daily and lesson attendance across the school.", "attendance record", ["Present, Absent, Late, Excused."]),
    section("Attendance analytics", "/admin/attendance/analytics", "Attendance rates and chronic absence.", "analytics entry", []),
    section("Staff", "/admin/staff", "Staff records: positions, departments, contacts.", "staff member", ["Link to Teacher assignments."], [{ title: "Give a new colleague access", steps: ["Ask them to register with their school email.", "Add them here with their position.", "Have an administrator assign their role (teacher, finance officer, admissions officer, principal). They can then sign in."] }]),
    section("Teacher assignments", "/admin/staff/teacher-assignments", "Which teacher teaches which subject in which class.", "assignment", ["A teacher only sees classes assigned here."]),
    section("Timetable and calendar", "/admin/calendar", "School calendar: terms, holidays, meetings, exams.", "calendar entry", []),
    section("Communication", "/admin/communication", "Announcements to parents, staff or classes.", "announcement", ["Link to New message."]),
    section("New message", "/admin/communication/new", "Write and send an announcement.", "message", [], [{ title: "Send an announcement", steps: ["Choose the audience (all parents, a class, staff).", "Write the subject and message.", "Click Save to send. It appears in portals."] }]),
    section("Inventory", "/admin/inventory", "Equipment, books and supplies with quantities and locations.", "item", []),
    section("Procurement", "/admin/procurement", "Purchase requests and orders.", "purchase request", ["Status: requested, approved, ordered, received."]),
    section("Visitors", "/admin/security/visitors", "Gate and reception visitor log.", "visitor", [], [{ title: "Sign a visitor in and out", steps: ["Click Add record, enter name, ID, person visited and time in.", "When they leave, Edit the row and fill time out."] }]),
    section("Discipline", "/admin/discipline", "Behaviour incidents and actions taken.", "incident", ["Visible only to authorised staff."]),
    section("Documents", "/admin/documents", "School documents and policies.", "document", []),
    section("Certificates", "/admin/certificates", "Certificates and awards issued to students.", "certificate", []),
    section("Governance", "/admin/governance", "Board meetings, policies and decisions.", "governance record", []),
    section("Reports", "/admin/reports", "Summary reports across the school.", "report", []),
    section("Settings", "/admin/settings", "School-wide settings.", "setting", ["Only administrators can change these."]),
    { name: "Intelligence", path: "/admin/ai", purpose: "Assistant that summarises school data and answers questions.", features: ["Ask questions in plain language."], buttons: [["Ask", "Sends your question."]], processes: [{ title: "Get a summary", steps: ["Type a question such as How many applications are under review?", "Click Ask and read the answer. Always double-check important figures on the source page."] }] },
    { name: "Architecture", path: "/admin/architecture", purpose: "Technical overview of how the platform's parts connect. For administrators and developers.", features: ["Read-only description of modules."], buttons: [], processes: [] },
  ],
};

export const teacherManual: Manual = {
  id: "teacher",
  title: "Teacher portal manual",
  audience: "Teachers",
  intro: "The teacher portal shows only the classes you are assigned to: registers, marks, assignments and learner notes.",
  access: [
    "Go to /teacher and sign in with your school email and password.",
    "If you see no classes, ask the office to add you under Teacher assignments.",
  ],
  pages: [
    {
      name: "Teacher dashboard", path: "/teacher",
      purpose: "Your daily workspace.",
      features: ["Counters: assigned classes, attendance registers pending today, marks to enter, assignments due.", "Class list with learners, today's attendance and latest mark."],
      buttons: [["New assignment", "Create homework or a task for a class."], ["Take register", "Opens today's attendance for a class."], ["Enter marks", "Opens the marks sheet for an assessment."]],
      processes: [
        { title: "Take the attendance register", steps: ["Click Take register on the class.", "Mark each learner Present, Absent, Late or Excused.", "Click Save before the lesson ends. Late registers weaken attendance reports."] },
        { title: "Enter marks", steps: ["Click Enter marks and choose the assessment.", "Type each learner's mark. Marks above the total are refused.", "Click Save. Your name and the time are recorded."] },
        { title: "Set an assignment", steps: ["Click New assignment.", "Choose the class, write the title, instructions and due date.", "Save. Learners and parents see it."] },
        { title: "Write report card comments", steps: ["Open the class and choose Report comments.", "Write a comment per learner before the principal's deadline.", "Save."] },
      ],
      tips: ["You cannot see fees or change another teacher's marks."],
    },
  ],
};

export const parentManual: Manual = {
  id: "parent",
  title: "Parent portal manual",
  audience: "Parents and guardians",
  intro: "The parent portal shows only your own children: attendance, results, fees and school news.",
  access: [
    "Go to /parent and sign in with the email you gave the school.",
    "First time: register with that same email. The school links your children to it.",
    "If a child is missing, contact the office so they can link them.",
  ],
  pages: [
    {
      name: "Parent dashboard", path: "/parent",
      purpose: "One view of your child's school life.",
      features: ["Child card with class and student number.", "Attendance rate and recent absences.", "Marks, term averages and published report cards.", "Fees: invoices, payments, receipts and balance.", "Announcements and calendar."],
      buttons: [["Contact school", "Opens the contact page to send a message."], ["View report", "Opens a published report card."], ["Statement", "Shows all invoices and payments."]],
      processes: [
        { title: "Check fees and pay", steps: ["Look at the Fees panel for the outstanding balance.", "Pay using the methods the school lists (bank, EcoCash or at the bursar).", "Keep your reference. Once the bursar records it, the receipt appears here."] },
        { title: "Read a report card", steps: ["Wait for the school to publish reports at term end.", "Click View report in the Academic panel."] },
        { title: "Query attendance or marks", steps: ["Click Contact school.", "Mention your child's name and student number. Attendance and marks go to the class teacher; fees to the finance office."] },
      ],
    },
  ],
};

export const manuals = [adminManual, teacherManual, parentManual];

export function manualToMarkdown(m: Manual): string {
  const out: string[] = [`# ${m.title}`, "", `For: ${m.audience}`, "", m.intro, "", "## How to get in", "", ...m.access.map((a, i) => `${i + 1}. ${a}`), ""];
  m.pages.forEach((p, i) => {
    out.push(`## ${i + 1}. ${p.name}`, "", `Address: \`${p.path}\``, "", `**Purpose:** ${p.purpose}`, "");
    if (p.features.length) out.push("**Features**", "", ...p.features.map((f) => `- ${f}`), "");
    if (p.buttons.length) out.push("**Buttons and actions**", "", "| Button | What it does |", "|---|---|", ...p.buttons.map(([b, d]) => `| ${b} | ${d} |`), "");
    p.processes.forEach((pr) => out.push(`**How to: ${pr.title}**`, "", ...pr.steps.map((s, j) => `${j + 1}. ${s}`), ""));
    if (p.tips?.length) out.push("**Tips**", "", ...p.tips.map((t) => `- ${t}`), "");
  });
  return out.join("\n");
}
