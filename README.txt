CIRCUITMIND v4.3 — READ THIS FIRST
===================================

WHAT'S NEW IN v4.3 (all fixes tested in a real browser against a mock AI provider)
----------------------------------------------------------------------------------
1. ANSWERS NOW LOOK RIGHT
   - Equations were never being typeset: the markdown library was eating the backslashes of \( ... \) and \[ ... \].
     Maths is now protected before markdown runs, so equations render properly in chat, lessons AND the PDF export.
   - The markdown library link was unpinned (newest version no longer ships the file) -> now pinned to marked@12.0.2.
     If it ever fails to load, a built-in fallback still formats headings/lists/bold instead of showing raw ## and **.
   - Answers follow a fixed, scannable layout: **Answer:** first, short ## sections, display equations on their own
     line, **Final answer:** with units. Material citations show as small chips instead of [MATERIAL 1: ...] text.
   - A new answer opens at its first line (not scrolled to the bottom). Shorter / More detail / Simpler buttons sit under
     the latest answer.
2. ANSWER LENGTH IS YOURS TO CHOOSE
   - Bar under the chat box: Quick (~100 words) / Standard (~350) / Detailed (~800, every step) / Full (no limit) / Custom (any word count).
     It also applies to lessons and whole-notes summaries. Your choice is remembered.
   - You can also just type "in 5 lines", "one paragraph", "just the formula" - that overrides the setting.
3. NO MORE "PATCHING" ERRORS
   - The old code kept asking the AI to "continue" whenever it thought something was missing (e.g. it counted "Q1..Q5"
     differently from "Problem 1..5") and glued junk onto the answer plus warning banners. Now it continues ONLY when the
     provider says it ran out of space, joins the pieces cleanly (no duplicated text, no broken equations) and removes a
     dangling half-equation if an answer is truly cut off.
   - Learns provider quirks automatically (max_tokens vs max_completion_tokens, temperature, output caps), retries on
     rate limits, hides <think> text, and shows plain-English errors (wrong key, wrong model, rate limit, no image support).
4. PDF READING
   - Text is rebuilt line by line (the old version flattened every page into one long line, wrecking equations/lists).
   - Scanned pages are OCR'd automatically after upload (progress shown); no need to click.
   - "Summarise ..." only starts the slow whole-library summary when you clearly mean your notes ("summarise my notes",
     "overview of the whole material"). "Summarise the DFT" is now a normal question.
   - Short follow-ups ("why?", "explain that again") now search your notes using the previous question too.
5. IMAGES AND FILES IN A QUESTION
   - Clear "Attach" button next to the box. Attach PNG/JPG photos, PDFs or PPTX; paste screenshots with Ctrl+V; or drag
     files onto the tutor panel. Big phone photos are shrunk automatically. PDFs attached to a question are read
     for that question only (scanned pages are sent as images). Image-only questions no longer get sent twice.
6. SETTINGS: a "Quick fill" menu for Gemini / Groq / OpenRouter / OpenAI sets the endpoint and a model name for you.
   Model names change over time - if you see "model not found", check the provider's current model list.

GIVING IT TO SOMEONE ELSE (e.g. a gift)
---------------------------------------
- Do NOT put your own API key in the files. He should paste his own key in settings (gear icon). A free Gemini key:
  aistudio.google.com/apikey  ->  Settings -> Quick fill -> Google Gemini -> paste key -> Save.
- Easiest way to run: VS Code + Live Server (as below), or drag the folder onto netlify.com/drop to get a link that
  works on his laptop or phone. His notes and chats stay in HIS browser only.
- He must upload his own PDFs/PPTX in "Study material" (they are stored in his browser, not shared with you).
- The AI can still make mistakes. Check important calculations.

------------------------------------------------------------------------------------------------------------------

CIRCUITMIND v4.0 — MATERIAL-FIRST ENGINEERING TUTOR
====================================================

WHAT THIS BUILD IS
------------------
A private, same-device engineering tutor for EFTL and DSP. It keeps the existing local material database and browser settings keys so it can be opened in the same browser profile as the previous build.

CORE FEATURES
-------------
- Three tutor modes: Ask Anything, Teach Me a Topic, and Solve With Me.
- Detailed teaching by default, with symbols, assumptions, equations, derivations, worked steps and checks.
- Separate EFTL and DSP workspaces, chats and material libraries.
- PDF, PPTX, PNG and JPEG material uploads; drag-and-drop; local IndexedDB storage.
- PNG/JPG attachments directly in chat questions, including multiple images, previews, removal before sending, and drag-and-drop onto the question composer. Images are sent to the configured model as vision inputs; they are not automatically added to the permanent material library. The selected model must support image input.
- PDF/PPTX text extraction and OCR for scanned PDF/image pages.
- Local BM25-style retrieval for targeted questions.
- Uploaded course material is the primary reference. Additional engineering explanation must be labelled and unsupported material must not be presented as if it came from the notes.

V4.0 — WHOLE-DOCUMENT SUMMARIES
-------------------------------
A broad request such as "summarise the material" now follows a separate multi-pass workflow:
1. It selects all uploaded documents in the active subject workspace.
2. It maps the extracted page/slide headings and document structure.
3. It divides the complete extracted text into sequential batches, retaining every extracted character and the original page/slide reference.
4. It asks the model to analyse every batch, capturing concepts, definitions, equations, derivations, procedures, worked-example types, diagrams/tables described in text, and important distinctions.
5. It synthesises those section summaries into one comprehensive summary in the original document order.
6. It reports how many pages/slides were readable and processed, and identifies pages with no extracted text.
7. It checks that cited filenames and page/slide numbers exist in the uploaded files. This validates reference locations, not whether each cited passage logically proves a claim.

This is materially more thorough than sending a handful of sampled pages to the model. It still depends on the accuracy of PDF/PPTX extraction and the selected AI model. Image-only diagrams, handwriting and badly extracted equations may require visual inspection. The system does not promise zero errors.

PDF EXPORTS
-----------
- Chat responses and generated lessons download as PDF files.
- Export opens a clean A4 print view with readable typography, formatted headings, lists, tables and MathJax-rendered equations. In the print dialog choose “Save as PDF”. This avoids flattening engineering equations into unreadable plain text.
- An internet connection is required for MathJax to typeset LaTeX before printing. Allow pop-ups for the local CIRCUITMIND page. The browser print dialog is used so the user can save a real PDF.

HOW TO RUN
----------
1. Extract this ZIP into a NEW folder. Do not overwrite or delete the old working folder.
2. Open the extracted folder in VS Code.
3. Run index.html using Live Server.
4. Use the SAME browser profile and SAME local origin (protocol, host and port) as the previous build to access the existing local material library and saved AI settings.
5. Open AI settings and confirm the existing endpoint, model and key are still present. If not, enter your own credentials; never share the API key.
6. Select the correct subject and upload or confirm the required material is present.

IMPORTANT DATA-PRESERVATION NOTES
---------------------------------
- IndexedDB database name and version remain: circuitmind-local-v1, version 1.
- Existing localStorage settings keys remain: cm_endpoint, cm_model, cm_key, cm_subject, and circuitmind_chat_v3_<SUBJECT>.
- Do not clear browser site data. It may erase the local material library, chat history and provider settings.
- Keep the old version and a copy of your original PDFs/PPTX files until the new build has been verified.

KNOWN LIMITATIONS
-----------------
- Image questions require a vision-capable model on the configured provider; text-only models may reject image inputs. Image attachments are limited to 8 MB each.
- A whole-document summary makes multiple sequential AI requests. Large documents may take longer and consume more provider usage than a single short answer.
- If the provider imposes rate limits, token limits or request failures, the summary may stop; the app will show the failure rather than claim it completed.
- Extracted text does not fully represent diagrams, handwritten annotations or image-only equations. OCR can misread symbols and subscripts.
- Citation checks verify that referenced files and page/slide numbers exist. They cannot guarantee semantic support for every claim.
- The targeted IDFT regression check only covers the recognised known example; it is not a general symbolic mathematics engine.
- AI-generated explanations can still contain errors. Verify important calculations independently.
- The API key is stored in localStorage for this private prototype. Do not publish the app or share the browser profile. A public deployment requires a protected backend.

FILES
-----
index.html                  Application structure and CDN libraries
style.css                   Interface styling
app.js                      Tutor, retrieval, document mapping, multi-pass summaries and PDF export
solver-legacy-backup.js     Preserved legacy solver (not loaded by this interface)
README.txt                  This guide


VERSION 4.2 QUALITY FIXES
- Increased answer output budget and added continuation handling when the provider reports an output-length stop.
- Added requested numbered-item completeness checks (for example, if 5 problems are requested, the tutor checks that 5 numbered problems appear before presenting the response as complete).
- Added stronger instructions to complete derivations, balance LaTeX delimiters and never claim missing work is complete.
- Removed the automatic unrelated IDFT regression text from ordinary answers.
- PDF export now waits for MathJax startup, equation typesetting and fonts before opening the print dialog. If MathJax fails, the export page displays an error rather than silently printing raw equations.
- Preserves the existing IndexedDB database name and localStorage settings/history keys.
- PNG/JPEG question attachments remain available in the chat composer.

IMPORTANT
This is a local browser prototype. Provider model limits and image-input support depend on the model configured by the user. PDF export requires internet access for MathJax CDN loading and a browser that supports Print > Save as PDF. A real browser/provider smoke test is still required on the target laptop before relying on it for exams.
