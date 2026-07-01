const EUR_TO_USD = 1.08;

export const SALARY_BANDS = {
  "under-3k": { min: 0, max: 3000, label: "Menos de $3k/mes" },
  "3k-5k": { min: 3000, max: 5000, label: "$3k – $5k/mes" },
  "5k-8k": { min: 5000, max: 8000, label: "$5k – $8k/mes" },
  "8k-plus": { min: 8000, max: Infinity, label: "Más de $8k/mes" },
};

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export function parseSalaryMonthlyUsd(salary) {
  if (!salary || typeof salary !== "string") return null;
  const s = salary.toLowerCase();
  const kMatches = [...s.matchAll(/([\d.]+)\s*k/gi)];
  if (kMatches.length < 2) return null;

  let min = parseFloat(kMatches[0][1]) * 1000;
  let max = parseFloat(kMatches[1][1]) * 1000;

  const isYearly = /\/\s*year|per\s+year|yearly|gross\s*\/\s*year/.test(s);
  const isEur = /€|eur/.test(s);

  if (isYearly) {
    min /= 12;
    max /= 12;
  }
  if (isEur) {
    min *= EUR_TO_USD;
    max *= EUR_TO_USD;
  }

  return { min, max };
}

function rangesOverlap(a, b) {
  return a.min < b.max && a.max > b.min;
}

export function jobMatchesSalaryBand(job, band) {
  if (!band || band === "all") return true;
  const filterRange = SALARY_BANDS[band];
  if (!filterRange) return true;
  const parsed = parseSalaryMonthlyUsd(job.salary);
  if (!parsed) return false;
  return rangesOverlap(parsed, filterRange);
}

export function applyJobFilters(jobs, filters = {}) {
  const {
    searchText = "",
    selectedType = "all",
    selectedSeniority = "all",
    selectedSalary = "all",
  } = filters;

  const normalizedSearch = searchText.toLowerCase().trim();
  const normalizedType = slugify(selectedType);
  const normalizedSeniority = slugify(selectedSeniority);

  let filtered = [...jobs];

  if (normalizedType !== "all") {
    filtered = filtered.filter((job) => slugify(job.type) === normalizedType);
  }

  if (normalizedSeniority !== "all") {
    filtered = filtered.filter((job) => slugify(job.seniority) === normalizedSeniority);
  }

  if (selectedSalary !== "all") {
    filtered = filtered.filter((job) => jobMatchesSalaryBand(job, selectedSalary));
  }

  if (normalizedSearch) {
    filtered = filtered.filter((job) => {
      return (
        String(job.title).toLowerCase().includes(normalizedSearch) ||
        String(job.company).toLowerCase().includes(normalizedSearch) ||
        String(job.location).toLowerCase().includes(normalizedSearch)
      );
    });
  }

  return filtered;
}

export function predictCount(jobs, filters) {
  return applyJobFilters(jobs, filters).length;
}

export function salaryBandForString(salary) {
  const parsed = parseSalaryMonthlyUsd(salary);
  if (!parsed) return null;
  const mid = (parsed.min + parsed.max) / 2;
  for (const [key, band] of Object.entries(SALARY_BANDS)) {
    if (mid >= band.min && mid < band.max) return key;
  }
  if (mid >= 8000) return "8k-plus";
  return null;
}
