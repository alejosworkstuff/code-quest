import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyJobFilters,
  parseSalaryMonthlyUsd,
  salaryBandForString,
  jobMatchesSalaryBand,
} from "../js/lib/filter-logic.js";

const sampleJobs = [
  { id: 1, title: "Dev", company: "A", type: "Remote", seniority: "Senior", salary: "$6k–9k USD / month" },
  { id: 2, title: "Dev", company: "B", type: "Onsite", seniority: "Junior", salary: "$2k–3k USD / month" },
];

describe("filter-logic", () => {
  it("filters by type Remote", () => {
    const result = applyJobFilters(sampleJobs, { selectedType: "Remote" });
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 1);
  });

  it("filters by seniority Senior", () => {
    const result = applyJobFilters(sampleJobs, { selectedSeniority: "Senior" });
    assert.equal(result.length, 1);
  });

  it("parses yearly EUR salary", () => {
    const parsed = parseSalaryMonthlyUsd("€45k–55k gross / year");
    assert.ok(parsed);
    assert.ok(parsed.min > 4000);
    assert.ok(parsed.max < 5000);
  });

  it("maps salary string to band", () => {
    const band = salaryBandForString("€45k–55k gross / year");
    assert.equal(band, "3k-5k");
  });

  it("matches salary band", () => {
    assert.equal(jobMatchesSalaryBand(sampleJobs[0], "5k-8k"), true);
    assert.equal(jobMatchesSalaryBand(sampleJobs[1], "8k-plus"), false);
  });
});
