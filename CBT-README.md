# Current release — October 16, 2026

See the October 2026 question selection update at the end of this file for the current 356-question bank, manual listening and 30/70 mix. Earlier release notes below are historical.

# JCAN EPS-TOPIK CBT and UBT

## October 2026 update

The current pool contains **240 questions: 146 reading and 94 listening**. This update adds 36 Book 1 reading questions and 4 chart exercises to the previous 200-question pool described below.

Book 1 was checked using the HRD Korea ZIP's 2024-edition PDF corrected in June 2025. All 36 selected answers match printed answer-key pages 363–366. The text and choices were also checked against their source pages. Four visual questions use a sale notice, train ticket, bankbook, and event schedule. Four additional JCAN-authored exercises use the two leisure charts on page 227; these are clearly labeled as chart-based practice, with explanations rather than an invented official answer-key reference. Copyright and source attribution appear in answer review.

Full UBT practice now offers **Reading first** or **Listening first** before starting. Each section still lasts 25 minutes, submitted sections are locked, and correct answers appear only after the entire attempt is submitted. CBT retains reading-first order. Single-section practice is unchanged.

Question-specific directions are preserved when randomizing. Korean spelling errors and mismatched topic/sign instructions were corrected. Deliberately incorrect answer choices remain unchanged.

Email-bound paid access uses Cloudflare Workers, D1, and Resend. See [EXAM-ACCESS-SETUP.md](EXAM-ACCESS-SETUP.md). It is not active on GitHub Pages; deployment and live email testing require the owner's accounts and a verified sending domain. The protected host checks exam pages, scripts, question data, and media on the server. One activation code grants unlimited attempts to one email; subsequent sign-ins use new one-time email codes.

Run tests with **Node.js 24+** because access tests use the built-in SQLite module. Automated tests include 300 randomized retries, both section orders, saved-state compatibility, media integrity, single-use codes, concurrent redemption, email binding, expiry, rate limits, logout, revocation, and protected asset access. Email delivery is mocked; no real emails were sent in tests. Results download as styled HTML with Print / Save as PDF.

## Earlier implementation notes (September 2026)

The counts and upload lists below document the earlier 200-question release. The October update above supersedes them.

Open cbt.html through the existing Exams page.

## Updated question bank

200 questions: 106 reading and 94 listening. This includes 192 unique questions from authorized free practice sessions at https://my.epstopik-exam.com/check and 8 additional reading questions from HRD Korea's NEW Standard Korean Textbook 2, published November 30, 2024.

Every new attempt selects 20 reading and 20 listening questions, balanced by the reference exam's question types. The current pool supports no repeated questions from the immediately previous attempt. Previously used questions eventually return: this is a finite bank, not unlimited new content. Selection prefers less-used questions, subject to the listening time limit. Practice modes use the corresponding 20-question section. History is stored in this browser; clearing browser storage resets it.

Resume restores the exact selected questions, answer keys, images, audio and timer. It does not generate another test. The full test has 25 minutes per section; each listening recording plays twice with the original instructions, examples and number clips. Generated sequences are checked to fit within 24 minutes 50 seconds, allowing a small margin. Network delays still count against the timer.

153 images and 122 MP3 files are stored locally. The deployed site does not fetch fresh content from the reference site.

## Answer-sheet indicators

- Blue background: answered.
- Red border and number: a visited question left unanswered.
- Orange border, orange number and !: marked for review. Orange takes priority if also skipped.
- Blue outer outline: current question.

Unvisited questions remain neutral. Answering a skipped question clears its red status. Review marks remain until explicitly cleared. Both states survive reload.

## Textbook cross-check

Official 2024 edition listing: https://epstopik.hrdkorea.or.kr/epstopik/book/std/standardBookList.do?lang=en

The official ZIP download did not complete during this update. The publisher's 2024-11-30 imprint and the relevant pages were checked in this accessible copy: https://www.koreanexamhelp.com/wp-content/uploads/2025/01/EPS-TOPIK-New-Syllabus-Book-02-2.pdf

Added reading exercises: Unit 31, page 24, items 3-4; Unit 32, page 34, item 4; Unit 33, page 44, items 2 and 4; Unit 35, page 64, items 2-4. All eight were compared with the imported question pool, visually checked against the book, and verified against the printed answer key on page 330. Text and answer choices are preserved; line wrapping and blank-line display are normalized for the website. Attribution and exact references are stored per question and shown in answer review. This is a targeted cross-check, not a complete audit or import of both textbook volumes. No textbook listening exercises were added without their recordings.

The reference-site questions retain their source answer keys; they are not all certified by the textbook. The repository owner confirmed permission to reuse the reference site's material. The textbook remains © HRD Korea. No endorsement or official test status is implied.

## Upload to GitHub

For this update, replace css/cbt.css, js/cbt.mjs, js/cbt-core.mjs, and data/eps-topik-media.json. Add data/eps-topik-pool.json and all new files inside media/eps-topik/. Existing media can stay. Upload folders into the repository root, not inside an extra JcanKLC1 folder. No existing website files need deletion.

The full website ZIP also includes the earlier cbt.html and exams.html changes. Keep CBT-README.md and tests/random-exam.test.mjs if maintaining documentation and tests. No build command, external API keys or backend is required.

## Local development

Requires Node.js 20+. Run npm start, then open http://127.0.0.1:4173/cbt.html. Run npm test for validation. No npm dependencies are required. Serve over HTTP, not file://.

data/eps-topik.json is the original 40-slot exam template with instructions and number clips. data/eps-topik-pool.json contains selectable questions with stable IDs, section/type groups, choices, answer keys, media and measured audio duration. Never shuffle number clips or detach a question from its media. data/eps-topik-media.json lists file sizes, SHA-256 hashes and provenance; some recovered entries reference the source session page rather than the exact media URL.

Tests cover 300 consecutive retries, no adjacent question repeats, media integrity, audio alignment and duration, saved-set reconstruction, skipped/review states, timers and scoring. Browser checks confirm red/orange indicators and saved progress. This is a static practice application, not a proctored exam system.

## UBT interface

Open ubt.html or choose Open UBT Mock Test on the Exams page. UBT uses the same unmodified 200-question bank, randomization, audio, scoring, review marks and 25-minute section timers as CBT. Its screenshot-inspired interface provides a blue solved/unsolved/time bar, separate question and answer panels, and a Total Questions overview with reading/listening grids. Small screens stack the panels. The overview does not pause the timer or unlock the inactive section. CBT and UBT save separate attempts and share question-selection history.

For this UBT update add ubt.html and css/ubt.css, and replace cbt.html, exams.html and js/cbt.mjs. Keep all existing question data and media unchanged. No deletions needed.
# October 2026 question selection update

Each new attempt excludes every question ID from the immediately preceding
attempt saved in this browser, including graph questions. CBT and UBT share
this history. Clearing browser storage or changing devices resets it; this
is not account-wide history and questions may return after intervening attempts.

The bank contains 356 questions, including six graph questions and 74 newly
verified textbook listening questions (21 Book 1 and 53 Book 2). Every new
20-question section contains exactly 6 Book 1 and 14 Book 2 questions, giving
12/28 in a full exam. Reading uses identified textbook questions and clearly
credited original JCAN questions on each book's topics. Graphs count toward
the Book 1 quota. Legacy questions without book provenance remain available
only for reconstructing older saved attempts, not new selection.

Question types may occupy different reading/listening slots to meet these
quotas. Harder questions are prioritized; 2–3 graphs are retained. Original
JCAN contextual and inference practice is not presented as official HRDK text.

Listening starts manually in both interfaces. CBT keeps native play, pause,
seek, volume and replay controls. UBT now matches the supplied tablet video:
a compact status bar, question/audio panel on the left, and four numbered
audio-only choice rows on the right. One click on a question or choice plays
that recording twice; the button then stays grey and disabled for the attempt.
The question's assigned EPS number is announced before its two passes.
Navigation and other play controls are disabled during the two-pass sequence;
answer selection remains independent. The next question never starts itself.

UBT budgets are stored per question and per choice in the saved attempt's
ubtPlayback map, and survive revisiting, marking for review and refreshing.
A started pass counts even if interrupted; a restored attempt can play only
its remaining pass. A failed start that never played does not spend a pass.
New attempts start with fresh budgets. These are browser practice rules,
not server-side proctoring. Post-submission review remains available.
Timers remain at 25 minutes per section.

Official source: https://epstopik.hrdkorea.or.kr/epstopik/book/std/standardBookList.do?lang=en
Original unit audio is retained unchanged from the official
textbook1_listen/textbook2_listen archives for provenance. The exam now plays
74 individual item clips, cut at the consistent long pauses between the five
numbered questions. Clips retain the spoken instructions and question audio
but exclude other items and the long trailing pause. They are 15–49 seconds
long; Book 2 Unit 36 item 5 is approximately 31 seconds. Each clip's source
path, item number, start/end times, duration and hash are recorded. The UI
identifies the unit and item, with no instruction to seek through a full unit.
The original spoken textbook item number is removed from all 74 clips at
the pause before the question instruction. After a manual Play action, the
existing EPS number announcement for the assigned exam slot (21–40) plays,
followed by the question. These number clips are re-encoded for compatibility
without replacing their speech. Pausing/resuming within the question does
not repeat the number. Stopping, navigating or playing a choice cancels a
pending transition. No section-wide autoplay is restored.
Printed choices and answers
were checked against textbook pages and answer-key pages; provenance records
the archive entry and printed location. Audio hashes in the media manifest
verify that the hosted files match the official archive bytes. Students can
replay spoken choices if present in a recording. Each printed choice also has
a manual Listen button using a separate local SunHi Korean neural voice
reading. These choice narrations are clearly distinguished from official
HRDK question audio; they are not presented as official recordings. Only one
recording plays at a time, and playing a choice does not select its answer.
