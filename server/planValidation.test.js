import test from "node:test";
import assert from "node:assert/strict";
import { readPlanPayload } from "./planValidation.js";

test("rejects missing and malformed plan payloads", () => {
  assert.match(readPlanPayload(null).error, /valid safety plan/i);
  assert.match(readPlanPayload({ contacts: [], checkedSteps: "contact" }).error, /must be lists/i);
});

test("trims contact details and keeps unique allowed checklist steps", () => {
  assert.deepEqual(
    readPlanPayload({
      contacts: [{ name: "  Ayesha ", detail: " +91 1234567890  " }],
      checkedSteps: ["contact", "contact", "unknown", "place"],
    }),
    {
      contacts: [{ name: "Ayesha", detail: "+91 1234567890" }],
      checkedSteps: ["contact", "place"],
    },
  );
});

test("rejects incomplete contacts and contacts that exceed field limits", () => {
  assert.match(readPlanPayload({ contacts: [{ name: "Ayesha", detail: " " }], checkedSteps: [] }).error, /complete/i);
  assert.match(
    readPlanPayload({ contacts: [{ name: "x".repeat(81), detail: "phone" }], checkedSteps: [] }).error,
    /length limits/i,
  );
  assert.match(
    readPlanPayload({ contacts: [{ name: "Ayesha", detail: "x".repeat(121) }], checkedSteps: [] }).error,
    /length limits/i,
  );
});

test("limits saved contacts and rejects non-string checklist values", () => {
  const tooManyContacts = Array.from({ length: 11 }, (_, index) => ({
    name: `Contact ${index}`,
    detail: `+91 12345678${index}`,
  }));
  assert.match(readPlanPayload({ contacts: tooManyContacts, checkedSteps: [] }).error, /up to 10/i);
  assert.match(readPlanPayload({ contacts: [], checkedSteps: ["contact", 1] }).error, /not valid/i);
});
