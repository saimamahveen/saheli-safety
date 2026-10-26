const allowedSteps = new Set(["contact", "charge", "place", "location"]);
const maxContacts = 10;

export function readPlanPayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "A valid safety plan is required." };
  }
  if (!Array.isArray(body.contacts) || !Array.isArray(body.checkedSteps)) {
    return { error: "Contacts and plan steps must be lists." };
  }
  if (body.contacts.length > maxContacts) {
    return { error: `You can save up to ${maxContacts} trusted contacts.` };
  }

  const contacts = [];
  for (const contact of body.contacts) {
    if (!contact || typeof contact.name !== "string" || typeof contact.detail !== "string") {
      return { error: "Each contact needs a name and contact detail." };
    }
    const name = contact.name.trim();
    const detail = contact.detail.trim();
    if (!name || !detail || name.length > 80 || detail.length > 120) {
      return { error: "Contact names and details must be complete and within the length limits." };
    }
    contacts.push({ name, detail });
  }

  if (body.checkedSteps.some((step) => typeof step !== "string")) {
    return { error: "Plan steps are not valid." };
  }
  const checkedSteps = [...new Set(body.checkedSteps)].filter((step) => allowedSteps.has(step));
  return { contacts, checkedSteps };
}
