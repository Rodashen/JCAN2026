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
