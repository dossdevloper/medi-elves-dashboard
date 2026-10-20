/**
 * zohopi.jsx  —  Zoho Creator JS SDK v1
 * CDN: https://js.zohostatic.com/creator/widgets/version/1.0/widgetsdk-min.js
 *
 * IMPORTANT — SDK v1 ZOHO.CREATOR.init() returns undefined by itself.
 * The logged-in user data comes inside the .then() callback argument.
 * Use ZOHO.CREATOR.UTIL.getInitParams() to get user/app info separately.
 */

import { useState, useEffect } from "react";

/* ─── APP CONFIG ─────────────────────────────────────────── */
export const ZOHO_APP = {
  appName: "mediElves",   // ← your Zoho Creator app link name
};

/* ─── REPORT & FIELD REGISTRY ────────────────────────────── */
export const REPORTS = {
  CLAIMS:    { reportName: "Add_Claim_Report" },
  DOCTORS:   { reportName: "All_Doctors" },
  HOSPITALS: { reportName: "All_Hospitals" },
  PATIENTS:  { reportName: "Add_Patient_Report" },
  STAFFS:    { reportName: "All_Staffs" },
  FOLLOW_UP: {
    reportName: "Follow_up1",
    fields: { followUpDate: "Follow_up_Date" },
  },
  CLAIM_STATUS: {
    reportName: "Add_Claim_Report",
    fields: { claimDate: "Claim_Date", status: "Status" },
    statusValues: ["Draft", "Lodged", "Partially Paid", "Fully Paid", "Rejected", "Resubmitted"],
  },
  PAYMENTS: {
    reportName: "Add_Payment_Report",
    // Zoho returns lowercase "payment_date" — confirmed from console sample record
    fields: { paymentDate: "payment_date", amount: "Amount" },
  },
  FEE_CALC: {
    reportName: "Medi_Elves_Fee_Calculation_Report",
    fields: {
      date:          "Date_field",
      paymentStatus: "Payment_Status",
      paymentAmount: "Payment_Amount",
      serviceFee:    "Service_Fee",
    },
  },
  DOCTOR_PAYMENTS: {
    reportName: "Add_Invocie_Report",
    fields: { paymentDate: "Payment_Date", payableAmount: "Payable_Amount" },
  },
  INVOICES: {
    reportName: "All_Invoices",
    fields: {
      invoiceDate: "Invoice_Date",
      status:      "Status",
      invoiceNo:   "Invoice_No",
      doctor:      "Doctor",
      dueDate:     "Due_Date",
      totalAUD:    "Total_AUD",
    },
  },
  CASHFLOW: {
    reportName: "Add_Claim_Report",
    fields: {
      claimDate:  "Claim_Date",
      collection: "Total_Claim_Amount",
      received:   "Allocated_Amount",
    },
  },

};



/* ─── RATE LIMIT HELPERS ─────────────────────────────────── */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const API_DELAY_MS = 350;

function isRateLimit(res) {
  if (!res) return false;
  if (res.status === 429 || res.code === 2955) return true;
  try {
    const t = res.responseText || res.message || "";
    if (t.includes("2955") || t.includes("rate") || t.includes("limit")) return true;
  } catch (_) {}
  return false;
}

async function zohoCall(fn, maxRetries = 3) {
  await sleep(API_DELAY_MS);
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fn();
      if (isRateLimit(res)) throw { __rateLimit: true, res };
      return res;
    } catch (err) {
      const limited = err?.__rateLimit || isRateLimit(err);
      if (limited && attempt < maxRetries) {
        const wait = 1000 * Math.pow(2, attempt);
        console.warn(`[MediElves] Rate limited — retry ${attempt + 1} in ${wait}ms`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
}

/* ─── LOW-LEVEL: COUNT ───────────────────────────────────── */
export async function getCount(reportName) {
  try {
    const config = { appName: ZOHO_APP.appName, reportName };
    const res = await zohoCall(() => ZOHO.CREATOR.API.getRecordCount(config));

    // ── CONSOLE: raw count response
    console.log(`[COUNT] ${reportName}`, res);

    if (res && res.code === 3000) {
      const count = parseInt(res.result?.records_count ?? "0", 10);
      console.log(`[COUNT] ${reportName} → ${count}`);
      return count;
    }
    console.warn(`[COUNT] FAILED ${reportName}`, res);
    return 0;
  } catch (e) {
    console.warn(`[COUNT] ERROR ${reportName}`, e);
    return 0;
  }
}

/* ─── LOW-LEVEL: ALL RECORDS (paginated) ─────────────────── */
export async function getAllRecords(reportName, criteria = "") {
  const allRecords = [];
  let page = 1;
  const pageSize = 200;

  while (true) {
    const config = {
      appName: ZOHO_APP.appName,
      reportName,
      page,
      pageSize,
      ...(criteria ? { criteria } : {}),
    };

    let res;
    try {
      res = await zohoCall(() => ZOHO.CREATOR.API.getAllRecords(config));
    } catch (e) {
      console.warn(`[RECORDS] ERROR ${reportName} page ${page}`, e);
      break;
    }

    // ── CONSOLE: raw response per page
    console.log(`[RECORDS] ${reportName} page ${page} raw response:`, res);

    if (!res || res.code !== 3000) {
      console.warn(`[RECORDS] BAD CODE ${reportName} page ${page} — code:`, res?.code, res);
      break;
    }

    const batch = Array.isArray(res.data) ? res.data : [];
    console.log(`[RECORDS] ${reportName} page ${page} → ${batch.length} records`, batch);

    allRecords.push(...batch);
    if (batch.length < pageSize) break;
    page++;
  }

  console.log(`[RECORDS] ${reportName} TOTAL → ${allRecords.length} records`);
  return allRecords;
}

/* ─── SHARED UTILS ───────────────────────────────────────── */
function toNum(val) {
  const n = parseFloat(String(val ?? "0").replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}
function sumField(records, field) {
  return records.reduce((s, r) => s + toNum(r[field]), 0);
}

/* ─── DATE HELPERS ───────────────────────────────────────── */
function toDate(str) {
  if (!str || str === "—") return null;
  // Zoho SDK v1 returns dates as "DD-Mon-YYYY" e.g. "13-May-2026"
  // Parse this format FIRST — new Date("13-May-2026") is unreliable cross-browser
  const zohoFmt = String(str).match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (zohoFmt) {
    const mo = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const month = mo[zohoFmt[2]];
    if (month !== undefined) {
      return new Date(parseInt(zohoFmt[3]), month, parseInt(zohoFmt[1]));
    }
  }
  // Fallback for ISO format "2026-05-13"
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
}
function startOfDay(d) { const r = new Date(d); r.setHours(0,0,0,0); return r; }

/* ── FINANCIAL YEAR HELPERS (AU: 1 Jul – 30 Jun) ──────────── */
export function getFinancialYearRange(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0=Jan ... 11=Dec
  const fyStartYear = m >= 6 ? y : y - 1; // FY starts in July (month index 6)
  const start = new Date(fyStartYear, 6, 1, 0, 0, 0, 0);           // 1 Jul
  const end   = new Date(fyStartYear + 1, 5, 30, 23, 59, 59, 999); // 30 Jun
  return { start, end, fyStartYear, fyEndYear: fyStartYear + 1 };
}

const FY_MONTH_LABELS = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];

export function getFinancialYearMonths(date = new Date()) {
  const { fyStartYear } = getFinancialYearRange(date);
  return FY_MONTH_LABELS.map((label, idx) => ({
    label,
    monthIndex: (6 + idx) % 12,                 // real calendar month 0-11
    year: idx < 6 ? fyStartYear : fyStartYear + 1,
  }));
}

export function currentFYMonthIndex(date = new Date()) {
  return (date.getMonth() + 6) % 12; // index into the Jul→Jun array above
}

export function getFYLabel(date = new Date()) {
  const { fyStartYear, fyEndYear } = getFinancialYearRange(date);
  return `FY ${fyStartYear}–${String(fyEndYear).slice(-2)}`; // e.g. "FY 2025–26"
}

export function filterByPeriod(records, dateField, period) {
  const now   = new Date();
  const today = startOfDay(now);
  const dow   = now.getDay();
  const wkS = new Date(today); wkS.setDate(today.getDate() - dow);
  const wkE = new Date(wkS); wkE.setDate(wkS.getDate() + 6); wkE.setHours(23,59,59,999);
  const nwS = new Date(wkS); nwS.setDate(wkS.getDate() + 7);
  const nwE = new Date(nwS); nwE.setDate(nwS.getDate() + 6); nwE.setHours(23,59,59,999);
  const moS = new Date(now.getFullYear(), now.getMonth(), 1);
  const moE = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const nmS = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nmE = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
  const in30 = new Date(now); in30.setDate(now.getDate() + 30); in30.setHours(23,59,59,999);
 const { start: yrS, end: yrE } = getFinancialYearRange(now);
  const todayE = new Date(today.getTime() + 86399999);

  return records.filter(r => {
    const d = toDate(r[dateField]);
    if (!d) return false;
    switch (period) {
      case "today":      return d >= today && d <= todayE;
      case "thisWeek":   return d >= wkS && d <= wkE;
      case "nextWeek":   return d >= nwS && d <= nwE;
      case "thisMonth":  return d >= moS && d <= moE;
      case "nextMonth":  return d >= nmS && d <= nmE;
      case "next30Days": return d >= today && d <= in30;
      case "thisYear":   return d >= yrS && d <= yrE;
      default:           return true;
    }
  });
}

/* ─── HIGH-LEVEL FETCHERS ────────────────────────────────── */

export async function fetchHeroCounts() {
  console.group("[MediElves] fetchHeroCounts");
  const claims    = await getCount(REPORTS.CLAIMS.reportName);
  const doctors   = await getCount(REPORTS.DOCTORS.reportName);
  const hospitals = await getCount(REPORTS.HOSPITALS.reportName);
  const patients  = await getCount(REPORTS.PATIENTS.reportName);
  const staffs    = await getCount(REPORTS.STAFFS.reportName);
  const result = { claims, doctors, hospitals, patients, staffs };
  console.log("[MediElves] heroCounts result:", result);
  console.groupEnd();
  return result;
}

export async function fetchFollowUpCounts() {
  console.group("[MediElves] fetchFollowUpCounts");
  const records = await getAllRecords(REPORTS.FOLLOW_UP.reportName);
  const df = REPORTS.FOLLOW_UP.fields.followUpDate;
  const result = {
    today:      filterByPeriod(records, df, "today").length,
    thisWeek:   filterByPeriod(records, df, "thisWeek").length,
    nextWeek:   filterByPeriod(records, df, "nextWeek").length,
    thisMonth:  filterByPeriod(records, df, "thisMonth").length,
    nextMonth:  filterByPeriod(records, df, "nextMonth").length,
    next30Days: filterByPeriod(records, df, "next30Days").length,
  };
  console.log("[MediElves] followUp result:", result);
  console.groupEnd();
  return result;
}

export async function fetchClaimStatusCounts() {
  console.group("[MediElves] fetchClaimStatusCounts");
  const records = await getAllRecords(REPORTS.CLAIM_STATUS.reportName);
  const sf = REPORTS.CLAIM_STATUS.fields.status;
  const result = { total: records.length };
  for (const sv of REPORTS.CLAIM_STATUS.statusValues) {
    result[sv] = records.filter(r => r[sf] === sv).length;
  }
  console.log("[MediElves] claimStatus result:", result);
  // Log status field values found to help debug mismatches
  const foundStatuses = [...new Set(records.map(r => r[sf]))];
  console.log("[MediElves] Status values found in records:", foundStatuses);
  console.groupEnd();
  return result;
}

export async function fetchPaymentTotals() {
  console.group("[MediElves] fetchPaymentTotals");
  const records = await getAllRecords(REPORTS.PAYMENTS.reportName);
  const df = REPORTS.PAYMENTS.fields.paymentDate;
  const af = REPORTS.PAYMENTS.fields.amount;

  // Log field verification
  if (records.length > 0) {
    console.log("[MediElves] Sample payment record:", records[0]);
    console.log("[MediElves] All field keys in payment:", Object.keys(records[0]));
    console.log("[MediElves] paymentDate field used:", df, "→ value:", records[0][df]);
    console.log("[MediElves] amount field used:", af, "→ value:", records[0][af]);
    const sampleDate = records[0][df];
    console.log("[MediElves] parsed date:", sampleDate, "→", toDate(sampleDate));
  }

  const p = period => {
    const f = filterByPeriod(records, df, period);
    console.log(`[MediElves] payments [${period}]: ${f.length} records, amount=${sumField(f, af)}`);
    return { count: f.length, amount: sumField(f, af) };
  };

  // Build monthly bar chart data from real records (financial year: Jul → Jun)
  const fyMonths = getFinancialYearMonths();
  const monthly = fyMonths.map(({ label, monthIndex, year }) => {
    const recs = records.filter(r => {
      const d = toDate(r[df]);
      return d && d.getMonth() === monthIndex && d.getFullYear() === year;
    });
    const total = sumField(recs, af);
    console.log(`[MediElves] payments ${label} ${year}: ${recs.length} records, total=${total}`);
    return { m: label, amt: Math.round((total / 1000) * 10) / 10 }; // in $K
  });

  const result = {
    today:     p("today"),
    thisWeek:  p("thisWeek"),
    thisMonth: p("thisMonth"),
    thisYear:  p("thisYear"),
    monthly,
  };
  console.log("[MediElves] payments result:", result);
  console.groupEnd();
  return result;
}

export async function fetchFeeCalc() {
  console.group("[MediElves] fetchFeeCalc");
  const records = await getAllRecords(REPORTS.FEE_CALC.reportName);
  const { date: df, paymentStatus: psf, paymentAmount: paf, serviceFee: sff } = REPORTS.FEE_CALC.fields;
  const pending  = records.filter(r => r[psf] === "Pending");
  const invoiced = records.filter(r => r[psf] === "Invoiced");
  const result = {
    totalServiceFee:  sumField(records,  sff),
    totalPaymentAmt:  sumField(records,  paf),
    pendingAmount:    sumField(pending,  paf),
    invoicedAmount:   sumField(invoiced, paf),
    today:     { fee: sumField(filterByPeriod(records, df, "today"),     sff) },
    thisMonth: { fee: sumField(filterByPeriod(records, df, "thisMonth"), sff) },
    thisYear:  { fee: sumField(filterByPeriod(records, df, "thisYear"),  sff) },
  };
  console.log("[MediElves] feeCalc result:", result);
  if (records.length > 0) console.log("[MediElves] Sample feeCalc record:", records[0]);
  const foundStatuses = [...new Set(records.map(r => r[psf]))];
  console.log("[MediElves] Payment_Status values found:", foundStatuses);
  console.groupEnd();
  return result;
}

export async function fetchDoctorPayments() {
  console.group("[MediElves] fetchDoctorPayments");
  const records = await getAllRecords(REPORTS.DOCTOR_PAYMENTS.reportName);

  // ── Log ALL field keys from first record so we know exact names
  if (records.length > 0) {
    console.log("[MediElves] Doctor payment sample record:", records[0]);
    console.log("[MediElves] Doctor payment ALL field keys:", Object.keys(records[0]));
  } else {
    console.warn("[MediElves] Doctor payments: 0 records returned");
    console.groupEnd();
    return { today:{count:0,amount:0}, thisWeek:{count:0,amount:0}, thisMonth:{count:0,amount:0}, thisYear:{count:0,amount:0}, monthly: [] };
  }

  // ── Auto-detect the date field (try both casings Zoho might return)
  const sampleRecord = records[0];
  const allKeys = Object.keys(sampleRecord);
  const dfConfig = REPORTS.DOCTOR_PAYMENTS.fields.paymentDate; // configured value
  let df = dfConfig;
  if (!sampleRecord[dfConfig] && sampleRecord["payment_date"]) {
    df = "payment_date";
    console.warn(`[MediElves] Date field "${dfConfig}" not found — using "payment_date" instead`);
  } else if (!sampleRecord[dfConfig] && sampleRecord["Payment_Date"]) {
    df = "Payment_Date";
  } else {
    // Try to find any date-like key automatically
    const dateKey = allKeys.find(k =>
      k.toLowerCase().includes("date") || k.toLowerCase().includes("payment")
    );
    if (dateKey && !sampleRecord[dfConfig]) {
      df = dateKey;
      console.warn(`[MediElves] Auto-detected date field: "${df}"`);
    }
  }

  // ── Auto-detect the amount field
  const afConfig = REPORTS.DOCTOR_PAYMENTS.fields.payableAmount;
  let af = afConfig;
  if (sampleRecord[afConfig] === undefined) {
    const amtKey = allKeys.find(k =>
      k.toLowerCase().includes("amount") || k.toLowerCase().includes("payable")
    );
    if (amtKey) {
      af = amtKey;
      console.warn(`[MediElves] Auto-detected amount field: "${af}"`);
    }
  }

  console.log(`[MediElves] Using date field: "${df}" → sample value: "${sampleRecord[df]}"`);
  console.log(`[MediElves] Using amount field: "${af}" → sample value: "${sampleRecord[af]}"`);
  console.log(`[MediElves] Parsed sample date: "${sampleRecord[df]}" →`, toDate(sampleRecord[df]));

  const p = period => {
    const f = filterByPeriod(records, df, period);
    const amount = sumField(f, af);
    console.log(`[MediElves] doctorPayments [${period}]: ${f.length} records, amount=${amount}`);
    return { count: f.length, amount };
  };

  // ── Monthly chart: financial year Jul → Jun, show real amounts for months with data
  const fyMonths = getFinancialYearMonths();

  const monthly = fyMonths.map(({ label, monthIndex, year }) => {
    const recs = records.filter(r => {
      const d = toDate(r[df]);
      if (!d) return false;
      return d.getMonth() === monthIndex && d.getFullYear() === year;
    });
    const total = sumField(recs, af);
    // Convert to $K with 1 decimal — keep 0 for empty months
    const amt = total > 0 ? Math.round((total / 1000) * 10) / 10 : 0;
    console.log(`[MediElves] doctorPayments ${label} ${year}: ${recs.length} records → $${total} → ${amt}K`);
    return { m: label, amt, raw: total, count: recs.length };
  });

  const result = {
    today:     p("today"),
    thisWeek:  p("thisWeek"),
    thisMonth: p("thisMonth"),
    thisYear:  p("thisYear"),
    monthly,
  };
  console.log("[MediElves] doctorPayments FINAL result:", result);
  console.groupEnd();
  return result;
}

export async function fetchInvoiceSummary() {
  console.group("[MediElves] fetchInvoiceSummary");
  const records = await getAllRecords(REPORTS.INVOICES.reportName);
  const { invoiceDate: df, status: sf, invoiceNo: nf, doctor: docf, dueDate: ddf, totalAUD: tf } = REPORTS.INVOICES.fields;
  const p = period => {
    const f = filterByPeriod(records, df, period);
    return { count: f.length, amount: sumField(f, tf) };
  };
  const statusBreakdown = { "Pending": 0, "Partially Paid": 0, "Paid": 0 };
  records.forEach(r => { if (r[sf] in statusBreakdown) statusBreakdown[r[sf]]++; });
  const sorted = [...records].sort((a, b) =>
    (toDate(b[df])?.getTime() ?? 0) - (toDate(a[df])?.getTime() ?? 0)
  );
  const recent = sorted.slice(0, 10).map(r => ({
    invoiceNo:   r[nf]  ?? "—",
    doctor:      typeof r[docf] === "object" ? (r[docf]?.display_value ?? "—") : (r[docf] ?? "—"),
    invoiceDate: r[df]  ?? "—",
    dueDate:     r[ddf] ?? "—",
    status:      r[sf]  ?? "—",
    totalAUD:    toNum(r[tf]),
  }));
  const result = { today: p("today"), thisWeek: p("thisWeek"), thisMonth: p("thisMonth"), thisYear: p("thisYear"), statusBreakdown, recent, total: records.length };
  console.log("[MediElves] invoices result:", result);
  if (records.length > 0) console.log("[MediElves] Sample invoice record:", records[0]);
  const foundStatuses = [...new Set(records.map(r => r[sf]))];
  console.log("[MediElves] Invoice Status values found:", foundStatuses);
  console.groupEnd();
  return result;
}

export async function fetchCashflowData() {
  console.group("[MediElves] fetchCashflowData");
  const records = await getAllRecords(REPORTS.CASHFLOW.reportName);
  const { claimDate: df, collection: cf, received: rf } = REPORTS.CASHFLOW.fields;

  if (records.length > 0) {
    console.log("[MediElves] Sample claim record:", records[0]);
    console.log("[MediElves] claimDate field used:", df, "→ value:", records[0][df]);
    console.log("[MediElves] collection field used:", cf, "→ value:", records[0][cf]);
    console.log("[MediElves] received field used:", rf, "→ value:", records[0][rf]);
  }

  const fyMonths = getFinancialYearMonths();

  const monthly = fyMonths.map(({ label, monthIndex, year }) => {
    const recs = records.filter(r => {
      const d = toDate(r[df]);
      return d && d.getMonth() === monthIndex && d.getFullYear() === year;
    });
    const colTotal = sumField(recs, cf);
    const recTotal = sumField(recs, rf);
    const col = Math.round((colTotal / 1000) * 10) / 10;
    const rec = Math.round((recTotal / 1000) * 10) / 10;
    console.log(`[MediElves] cashflow ${label} ${year}: ${recs.length} records → collections=$${colTotal} (${col}K), received=$${recTotal} (${rec}K)`);
    return { m: label, col, rec, colRaw: colTotal, recRaw: recTotal, count: recs.length };
  });

  const result = { monthly };
  console.log("[MediElves] cashflow result:", result);
  console.groupEnd();
  return result;
}

/* ─── MASTER HOOK ────────────────────────────────────────── */
export function useZohoData() {
  const [data,    setData]    = useState({});
  const [user,    setUser]    = useState({ name: "", email: "", accountName: "", initParams: null });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    const merge = partial => { if (!cancelled) setData(prev => ({ ...prev, ...partial })); };

    async function load() {
      try {
        /**
         * SDK v1: ZOHO.CREATOR.init() resolves with undefined.
         * The logged-in user info is NOT in the init promise return.
         * Use ZOHO.CREATOR.UTIL.getQueryParams() for page params,
         * or read the user from a separate API call.
         *
         * We call init() first to activate the SDK, then use
         * ZOHO.CREATOR.API.getCurrentUser() if available,
         * otherwise we extract from getInitParams if SDK exposes it.
         */

        // Step 0a: Activate SDK
        const initRaw = await ZOHO.CREATOR.init();
        console.log("=== ZOHO.CREATOR.init() raw return ===");
        console.log(initRaw);          // will likely be undefined — that is normal for SDK v1
        console.log("typeof initRaw:", typeof initRaw);
        console.log("======================================");

        // Step 0b: Try getInitParams (works in some SDK v1 builds)
        let initParams = null;
        try {
          initParams = await ZOHO.CREATOR.UTIL.getInitParams();
          console.log("=== ZOHO.CREATOR.UTIL.getInitParams() ===");
          console.log(JSON.stringify(initParams, null, 2));
          console.log("==========================================");
        } catch (e) {
          console.warn("[MediElves] getInitParams not available in this SDK build:", e);
        }

        // Step 0c: Try getCurrentUser (available in some SDK versions)
        let currentUser = null;
        try {
          if (typeof ZOHO.CREATOR.API.getCurrentUser === "function") {
            currentUser = await ZOHO.CREATOR.API.getCurrentUser();
            console.log("=== ZOHO.CREATOR.API.getCurrentUser() ===");
            console.log(JSON.stringify(currentUser, null, 2));
            console.log("==========================================");
          } else {
            console.log("[MediElves] getCurrentUser() not available in SDK v1");
          }
        } catch (e) {
          console.warn("[MediElves] getCurrentUser error:", e);
        }

        // Step 0d: Try getQueryParams (has page context info)
        try {
          const qp = ZOHO.CREATOR.UTIL.getQueryParams();
          console.log("=== ZOHO.CREATOR.UTIL.getQueryParams() ===");
          console.log(JSON.stringify(qp, null, 2));
          console.log("===========================================");
        } catch (e) {
          console.warn("[MediElves] getQueryParams error:", e);
        }

        // ── Derive user display info from whatever is available
        const loginUser    = initParams?.loginUser    || currentUser?.data?.Email || "";
        const accountOwner = initParams?.accountOwner || currentUser?.data?.Name  || "";
        const appLinkName  = initParams?.appLinkName  || ZOHO_APP.appName;

        const displayName = loginUser
          ? loginUser.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
          : accountOwner || "Admin";

        if (!cancelled) {
          setUser({ name: displayName, email: loginUser, accountName: accountOwner, appLinkName, initParams });
        }
        if (appLinkName && appLinkName !== ZOHO_APP.appName) {
          ZOHO_APP.appName = appLinkName;
        }

        // ── Sequential data fetches ──────────────────────────────
        console.group("=== MediElves Data Fetch Start ===");

        const heroCounts = await fetchHeroCounts();
        merge({ heroCounts });

        const claimStatus = await fetchClaimStatusCounts();
        merge({ claimStatus, heroCounts: { ...heroCounts, claims: claimStatus.total } });

        const followUp = await fetchFollowUpCounts();
        merge({ followUp });

        const payments = await fetchPaymentTotals();
        merge({ payments });

        const feeCalc = await fetchFeeCalc();
        merge({ feeCalc });

        const doctorPayments = await fetchDoctorPayments();
        merge({ doctorPayments });

        const invoices = await fetchInvoiceSummary();
        merge({ invoices });

         const cashflow = await fetchCashflowData();
        merge({ cashflow });

        console.log("=== MediElves Final Data Summary ===");
        console.log("heroCounts:",    heroCounts);
        console.log("claimStatus:",   claimStatus);
        console.log("followUp:",      followUp);
        console.log("payments:",      payments);
        console.log("feeCalc:",       feeCalc);
        console.log("doctorPayments:",doctorPayments);
        console.log("invoices:",      invoices);
        console.groupEnd();

        if (!cancelled) setLoading(false);

      } catch (err) {
        console.error("[MediElves] Fatal error:", err);
        if (!cancelled) {
          setError(err?.message ?? "Failed to load Zoho data");
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { data, user, loading, error };
}

/* ─── FORMAT HELPERS ─────────────────────────────────────── */
export function fmtAUD(amount) {
  const n = Number(amount) || 0;
  return `$${n.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
}
export function fmtCount(n) {
  return (Number(n) || 0).toLocaleString();
}