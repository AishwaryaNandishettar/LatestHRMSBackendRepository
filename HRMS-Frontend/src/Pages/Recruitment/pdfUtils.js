
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/* ─────────────────────────────────────────────────────────────
   PDF.js worker — set once, reuse forever
───────────────────────────────────────────────────────────── */
let _pdfjsLib = null;

async function getPdfjs() {
  if (_pdfjsLib) return _pdfjsLib;
  
  try {
    console.log("Loading PDF.js...");
    
    // Try different loading methods with better error handling
    let pdfjsModule;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts && !pdfjsModule) {
      attempts++;
      console.log(`PDF.js loading attempt ${attempts}...`);
      
      try {
       await loadPdfJsScript();
pdfjsModule = window.pdfjsLib;

        
        if (pdfjsModule) {
          console.log(`PDF.js loaded successfully on attempt ${attempts}`);
          break;
        }
      } catch (error) {
        console.log(`PDF.js loading attempt ${attempts} failed:`, error);
        if (attempts === maxAttempts) {
          throw error;
        }
      }
    }
    
    if (!pdfjsModule) {
      throw new Error("All worker paths failed to load");
    }
    
    _pdfjsLib = pdfjsModule;
    
    // Set worker with fallback options
    try {
      _pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    } catch (workerError) {
      console.warn("Worker setup failed, trying alternative:", workerError);
      _pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
    }
    
    console.log("PDF.js loaded successfully");
    console.log("PDF.js version:", _pdfjsLib.version || "Unknown");
    
    return _pdfjsLib;
    
  } catch (error) {
    console.error("Failed to load PDF.js after all attempts");
    throw new Error(`Failed to load PDF.js: ${error.message}`);
  }
}

// Helper function to load PDF.js via script tag
function loadPdfJsScript() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/* ─────────────────────────────────────────────────────────────
   renderPdfToImages
   Renders every page of a PDF to a PNG data URL.
   Returns: string[]  (one data URL per page)
───────────────────────────────────────────────────────────── */
export async function renderPdfToImages(pdfData, scale = 1.5) {
  try {
    console.log("=== renderPdfToImages called ===");
    console.log("PDF data type:", pdfData instanceof ArrayBuffer ? "ArrayBuffer" : typeof pdfData);
    console.log("PDF data size:", pdfData?.byteLength || pdfData?.length || 0);
    
    if (!pdfData || (pdfData.byteLength === 0 && pdfData.length === 0)) {
      throw new Error("No PDF data provided or empty data");
    }
    
    const pdfjsLib = await getPdfjs();
    console.log("PDF.js library loaded successfully");
    console.log("PDF.js version:", pdfjsLib.version);

    const data = pdfData instanceof Uint8Array ? pdfData : new Uint8Array(pdfData);
    console.log("Uint8Array created, length:", data.length);
    console.log("First few bytes:", Array.from(data.slice(0, 10)).map(b => b.toString(16)).join(' '));
    
    // Validate PDF header
    const pdfHeader = String.fromCharCode(...data.slice(0, 4));
    if (pdfHeader !== '%PDF') {
      console.warn("Warning: Data doesn't start with PDF header, got:", pdfHeader);
    }
    
    console.log("Loading PDF document...");
    
    const loadingTask = pdfjsLib.getDocument({ 
      data,
      verbosity: 1, // Enable verbose logging
      disableAutoFetch: false,
      disableStream: false
    });
    
    // Add progress listener
    loadingTask.onProgress = (progress) => {
      console.log("PDF loading progress:", Math.round((progress.loaded / progress.total) * 100) + "%");
    };
    
    const pdf = await loadingTask.promise;
    console.log("PDF loaded successfully!");
    console.log("Number of pages:", pdf.numPages);
    console.log("PDF info:", await pdf.getMetadata());
    
    const images = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      console.log(`Rendering page ${p}/${pdf.numPages}...`);
      
      try {
        const page = await pdf.getPage(p);
        const vp = page.getViewport({ scale });
        
        console.log(`Page ${p} viewport:`, { 
          width: vp.width, 
          height: vp.height, 
          scale: vp.scale,
          rotation: vp.rotation 
        });
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        canvas.width = vp.width;
        canvas.height = vp.height;
        
        // Clear canvas with white background
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        console.log(`Starting render for page ${p}...`);
        
        const renderTask = page.render({ 
          canvasContext: context, 
          viewport: vp,
          enableWebGL: false // Disable WebGL for compatibility
        });
        
        await renderTask.promise;
        
        console.log(`Page ${p} rendered successfully`);
        
        const dataUrl = canvas.toDataURL("image/png", 0.95);
        images.push(dataUrl);
        
        console.log(`Page ${p} converted to data URL, length:`, dataUrl.length);
        
        // Clean up
        page.cleanup();
        
      } catch (pageError) {
        console.error(`Error rendering page ${p}:`, pageError);
        // Continue with other pages
      }
    }

    console.log("=== All pages rendered successfully ===");
    console.log("Total images:", images.length);
    
    if (images.length === 0) {
      throw new Error("No pages were successfully rendered");
    }
    
    return images;
    
  } catch (err) {
    console.error("=== renderPdfToImages ERROR ===");
    console.error("Error type:", err.constructor.name);
    console.error("Error message:", err?.message);
    console.error("Error stack:", err?.stack);
    
    // Try to provide more specific error information
    if (err.message?.includes("Invalid PDF")) {
      console.error("PDF validation failed - the data may be corrupted");
    } else if (err.message?.includes("worker")) {
      console.error("PDF.js worker failed to load - check worker path");
    } else if (err.message?.includes("canvas")) {
      console.error("Canvas rendering failed - browser compatibility issue");
    }
    
    return [];
  }
}

/* ─────────────────────────────────────────────────────────────
   buildPlaceholderMap  — form → { "placeholder": "value" }
───────────────────────────────────────────────────────────── */
export function buildPlaceholderMap(form) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  
  return {
    // Standard {{placeholder}} format
    "{{candidateName}}":   form.candidateName   || "",
    "{{candidateEmail}}":  form.candidateEmail  || "",
    "{{position}}":        form.position        || "",
    "{{department}}":      form.department      || "",
    "{{location}}":        form.location        || "",
    "{{joiningDate}}":     form.joiningDate     || "",
    "{{ctc}}":             form.ctc             || "",
    "{{basic}}":           form.basic           || "",
    "{{hra}}":             form.hra             || "",
    "{{allowances}}":      form.allowances      || "",
    "{{bonus}}":           form.bonus || form.variablePay || "",
    "{{probationPeriod}}": form.probationPeriod || "",
    "{{noticePeriod}}":    form.noticePeriod    || "",
    "{{offerValidUntil}}": form.offerValidUntil || "",
    "{{companyName}}":     form.companyName     || "",
    "{{today}}":           today,
    "{{grade}}":           form.grade           || "",
    "{{grossSalary}}":     form.grossSalary     || "",
    "{{grossFixedCtc}}":   form.grossFixedCtc   || "",
    "{{variablePay}}":     form.variablePay     || "",
    "{{hrName}}":          form.hrName          || "",
    "{{hrDesignation}}":   form.hrDesignation   || "",
    
    // Square bracket format [Placeholder] for your dummy template
    "[Recipient Name]":    form.candidateName   || "",
   "[Date]": form.joiningDate || today,
    "[Title]":             form.position        || "",
    "[Company Name]":      form.companyName     || "",
    "[Street Address]":    form.location        || "",
    "[City, ST ZIP Code]": form.location        || "",
    "[Your Name]":         form.hrName          || "HR Manager",
    
    // ALL CAPS format for your dummy template
    "YOUR COMPANY NAME":   form.companyName     || "OMOIKANE INNOVATIONS PVT LTD",
    "POSITION APPLIED FOR": form.position       || "",
    "DATE TO START":       form.joiningDate     || "",
    
    // Direct text replacements for common patterns
    "Recipient Name":      form.candidateName   || "",
    "COMPANY NAME":        form.companyName     || "OMOIKANE INNOVATIONS PVT LTD",
    "Company Information or on letterhead": form.companyName || "OMOIKANE INNOVATIONS PVT LTD",
  };
}

/* ─────────────────────────────────────────────────────────────
   replacePlaceholdersInPdf
   Returns a Uint8Array of the modified PDF bytes.
───────────────────────────────────────────────────────────── */
export async function replacePlaceholdersInPdf(originalArrayBuffer, form) {
  try {
    console.log("=== replacePlaceholdersInPdf called ===");
    console.log("Original ArrayBuffer size:", originalArrayBuffer?.byteLength);
    console.log("Form data:", form);
    
    // Ensure we have a valid ArrayBuffer
    if (!originalArrayBuffer || originalArrayBuffer.byteLength === 0) {
      throw new Error("Invalid or empty ArrayBuffer provided");
    }
    
    // Create a fresh copy to avoid detached buffer issues
    const freshBuffer = originalArrayBuffer.slice
  ? originalArrayBuffer.slice(0)
  : originalArrayBuffer;
    console.log("Fresh buffer created, size:", freshBuffer.byteLength);
    
    // ── Strategy A: raw byte replacement for placeholders ──
    const originalBytes = new Uint8Array(freshBuffer);
    console.log("Uint8Array created from fresh buffer, length:", originalBytes.length);
    
    let pdfStr = "";
    for (let i = 0; i < originalBytes.length; i++) {
      pdfStr += String.fromCharCode(originalBytes[i]);
    }
    
    console.log("PDF string created, length:", pdfStr.length);

    const map = buildPlaceholderMap(form);
    console.log("Placeholder map:", map);
    
    let modified = pdfStr;
    let replaced = false;
    let replacementCount = 0;
    
    for (const [placeholder, value] of Object.entries(map)) {
      if (modified.includes(placeholder)) {
        const beforeLength = modified.length;
        modified = modified.split(placeholder).join(value);
        const afterLength = modified.length;
        
        if (beforeLength !== afterLength) {
          replaced = true;
          replacementCount++;
          console.log(`Replaced "${placeholder}" with "${value}"`);
        }
      }
    }
    
    console.log(`Total replacements made: ${replacementCount}`);

    if (replaced) {
      console.log("Creating output array from modified string...");
      const out = new Uint8Array(modified.length);
      for (let i = 0; i < modified.length; i++) {
        out[i] = modified.charCodeAt(i) & 0xff;
      }
      console.log("Output array created, length:", out.length);
      return out;
    }

    console.log("No replacements made, trying advanced PDF processing...");
    // ── Strategy B: find real text positions and overlay ──
    return await overlayRealTextInPdf(freshBuffer, form);

  } catch (err) {
    console.error("[pdfUtils] replacePlaceholdersInPdf error:", err);
    console.error("Error stack:", err.stack);
    
    // Return original data as fallback
    try {
      return new Uint8Array(originalArrayBuffer.slice(0));
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      throw new Error("PDF processing failed completely: " + err.message);
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   overlayRealTextInPdf
   Uses PDF.js to extract exact text item positions, then
   uses pdf-lib to white-out those exact areas and draw new text.

   Handles PDFs that already have real names/values (not placeholders).
───────────────────────────────────────────────────────────── */
async function overlayRealTextInPdf(originalArrayBuffer, form) {
  try {
    const pdfjsLib = await getPdfjs();

    // ✅ CREATE SAFE COPY
  const safeBuffer = originalArrayBuffer.slice(0);

    // ✅ USE SAFE COPY
    const pdfJsDoc = await pdfjsLib
      .getDocument({ data: new Uint8Array(safeBuffer) })
      .promise;

    // Collect text items per page
    const pageTextItems = [];
    for (let p = 1; p <= pdfJsDoc.numPages; p++) {
      const page = await pdfJsDoc.getPage(p);
      const content = await page.getTextContent();
      // Each item: { str, transform: [sx,kx,ky,sy,tx,ty], width, height }
      pageTextItems.push(
        content.items.map(item => ({
          text:     item.str,
          x:        item.transform[4],
          y:        item.transform[5],
          fontSize: Math.abs(item.transform[3]) || 10,
          width:    item.width,
          height:   item.height || Math.abs(item.transform[3]) || 10,
        }))
      );
    }

    // ── 2. Load PDF with pdf-lib for modification ──
   const pdfDoc = await PDFDocument.load(safeBuffer, {
  ignoreEncryption: true,
});
    const pages  = pdfDoc.getPages();
    const font     = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ── 3. Build replacement rules ──
    // Each rule: find text matching `find` on page `pageIdx`, replace with `value`
    const candidateName  = form.candidateName  || "";
    const candidateEmail = form.candidateEmail || "";
    const position       = form.position       || "";
    const department     = form.department     || "";
    const location       = form.location       || "";

    // We process page 0 (first page) for candidate details
    const items0 = pageTextItems[0] || [];

    // Helper: find item whose text contains a substring (case-insensitive)
    const findItem = (substr) =>
      items0.find(it => it.text.toLowerCase().includes(substr.toLowerCase()) && it.text.trim().length > 0);

    // Helper: find item whose text exactly matches (trimmed)
    const findExact = (str) =>
      items0.find(it => it.text.trim() === str.trim());

    // ── 4. Apply overlays on page 1 ──
    if (pages[0]) {
      const page = pages[0];

      // --- Candidate Name ---
      // The name line is typically a standalone bold line near the top
      // Look for "Dear" first, then the name is 1-2 lines above it
      const dearItem = findItem("dear ");

      if (dearItem && candidateName) {
        // Find the name item: it's above "Dear", same x, within ~30pt
        const nameItem = items0.find(it =>
          it.y > dearItem.y + 5 &&
          it.y < dearItem.y + 60 &&
          it.text.trim().length > 1 &&
          !it.text.toLowerCase().includes("dear") &&
          !it.text.toLowerCase().includes("dated") &&
          !it.text.toLowerCase().includes("ref")
        );

        if (nameItem) {
          whiteOutAndDraw(page, nameItem, candidateName, fontBold);
        } else {
          // Fallback: draw name 20pt above "Dear" line
          const fallbackY = dearItem.y + 20;
          whiteOutAndDraw(page, {
            x: dearItem.x, y: fallbackY,
            width: 200, height: dearItem.fontSize + 4,
            fontSize: dearItem.fontSize,
          }, candidateName, fontBold);
        }

        // --- "Dear [FirstName]," line ---
        const firstName = candidateName.split(" ")[0];
        whiteOutAndDraw(page, dearItem, `Dear ${firstName},`, fontBold);
      }
    }

    return await pdfDoc.save();

  } catch (err) {
    console.error("[pdfUtils] overlayRealTextInPdf error:", err);
    return new Uint8Array(originalArrayBuffer.slice(0));
  }
}

/* ─────────────────────────────────────────────────────────────
   whiteOutAndDraw
   Draws a white rectangle over an existing text item's bounding
   box, then draws new text at the same position.
───────────────────────────────────────────────────────────── */
function whiteOutAndDraw(pdfLibPage, item, newText, font) {
  const padding = 2;
  const fs = item.fontSize || 10;
  const w  = Math.max(item.width || 0, newText.length * fs * 0.6) + 20;
  const h  = (item.height || fs) + padding * 2;

  // White rectangle to cover existing text
  pdfLibPage.drawRectangle({
    x:       item.x - padding,
    y:       item.y - padding,
    width:   w,
   height: h + 4,
    color:   rgb(1, 1, 1),
    opacity: 1,
  });

 // Draw new text exactly aligned
pdfLibPage.drawText(newText, {
  x: item.x,
  y: item.y + 2, // small vertical correction
  size: fs,
  font,
  color: rgb(0, 0, 0),
  maxWidth: item.width,
});
}
export async function extractEditableFields(pdfData) {
  try {
    const pdfjsLib = await getPdfjs();

    const pdf = await pdfjsLib.getDocument({
      data: pdfData
    }).promise;

    const fields = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      // Get the page's natural dimensions in PDF points
      const viewport = page.getViewport({ scale: 1 });
      const pageWidth = viewport.width;
      const pageHeight = viewport.height;

      content.items.forEach((item, index) => {
        const text = item.str?.trim();

        // ✅ Make ALL text elements editable (not just placeholders)
        if (text && text.length > 0) {
          // Skip very small text (like dots, spaces, etc.)
          if (text.length >= 1 && text !== " " && text !== ".") {
            fields.push({
              page: p - 1, // 0-indexed page
              key: text, // Use the actual text as the key
              value: text, // Current value is the text itself
              x: item.transform[4],
              y: item.transform[5],
              width: Math.max(item.width || 0, text.length * 8) + 20, // Minimum clickable area
              height: Math.max(item.height || 0, Math.abs(item.transform[3]) || 12) + 4,
              fontSize: Math.abs(item.transform[3]) || 12,
              originalText: text, // Store original text for reference
              index: index, // Store index for unique identification
              pageWidth,   // ✅ needed for coordinate scaling
              pageHeight,  // ✅ needed for coordinate scaling
            });
          }
        }
      });
    }

    console.log(`✅ Extracted ${fields.length} editable text fields from ${pdf.numPages} pages`);
    return fields;

  } catch (err) {
    console.error("Error extracting editable fields:", err);
    return [];
  }
}

/* ─────────────────────────────────────────────────────────────
   applyFieldEditsTopdf
   Takes the original PDF bytes + the array of edited fields,
   white-outs each original text item and draws the new value.
   Returns a Uint8Array of the modified PDF.
───────────────────────────────────────────────────────────── */
export async function applyFieldEditsTopdf(originalArrayBuffer, fields) {
  try {
    if (!originalArrayBuffer || originalArrayBuffer.byteLength === 0) {
      throw new Error("Invalid or empty ArrayBuffer");
    }

    // Only process fields whose value has changed from the original
    const changedFields = fields.filter(f => f.value !== f.originalText);

    if (changedFields.length === 0) {
      // Nothing changed — return original bytes unchanged
      return new Uint8Array(originalArrayBuffer.slice(0));
    }

    const safeBuffer = originalArrayBuffer.slice(0);

    // Load with pdf-lib for modification
    const pdfDoc = await PDFDocument.load(safeBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const field of changedFields) {
      const page = pages[field.page];
      if (!page) continue;

      const { height: pageH } = page.getSize();
      const fs = field.fontSize || 11;

      // White-out the original text area
      const padding = 2;
      const rectW = Math.max(field.width || 0, (field.originalText?.length || 1) * fs * 0.6) + 10;
      const rectH = fs + padding * 2 + 4;

      page.drawRectangle({
        x: field.x - padding,
        y: field.y - padding,
        width: rectW,
        height: rectH,
        color: rgb(1, 1, 1),
        opacity: 1,
      });

      // Draw the new text at the same position
      page.drawText(field.value || "", {
        x: field.x,
        y: field.y + 1,
        size: fs,
        font,
        color: rgb(0, 0, 0),
        maxWidth: rectW,
      });
    }

    const savedBytes = await pdfDoc.save();
    console.log(`✅ Applied ${changedFields.length} field edits to PDF`);
    return savedBytes;

  } catch (err) {
    console.error("[pdfUtils] applyFieldEditsTopdf error:", err);
    // Return original as fallback
    return new Uint8Array(originalArrayBuffer.slice(0));
  }
}