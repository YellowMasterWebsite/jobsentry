const BACKEND = "http://localhost:3000/api/ingest/linkedin";
const SECRET = "change-me"; // must match BACKEND_INGEST_SECRET

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;
  if (!tab.url || !tab.url.includes("linkedin.com/jobs")) {
    alert("Open a LinkedIn Jobs search/results page first.");
    return;
  }
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const out = [];
      const items = document.querySelectorAll(".jobs-search-results__list-item, .jobs-search__results-list li, .base-card");
      items.forEach(li => {
        const titleEl = li.querySelector("a.job-card-list__title, a.job-card-container__link, a[href*='/jobs/view/']");
        const companyEl = li.querySelector(".job-card-container__company-name, .artdeco-entity-lockup__subtitle span, .base-search-card__subtitle, .job-search-card__subtitle");
        const locEl = li.querySelector(".job-card-container__metadata-item, .job-search-card__location");
        const metaEl = li.querySelector("time, .job-search-card__listdate, .job-search-card__listdate--new");
        const appsEl = li.querySelector(".job-card-container__footer-item--highlight, .job-insight\:applicants, .job-search-card__insight");
        const url = titleEl?.href || titleEl?.getAttribute('href');
        const title = titleEl?.innerText?.trim();
        const company = companyEl?.innerText?.trim();
        const location = locEl?.innerText?.trim();
        const postedText = metaEl?.getAttribute('datetime') || metaEl?.innerText?.trim();
        const applicantsText = appsEl?.innerText?.match(/(\d+)[^\d]*applicant/i)?.[1];
        const applicants = applicantsText ? Number(applicantsText) : null;
        if (url && title && company) out.push({ url, title, company, location, postedAt: postedText || null, applicants });
      });
      return out;
    }
  });
  const items = result.result || [];
  await fetch(BACKEND, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-jobsentry-secret': SECRET }, body: JSON.stringify({ items }) });
  alert(`Sent ${items.length} jobs to JobSentry.`);
});
