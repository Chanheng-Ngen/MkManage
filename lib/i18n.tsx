"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "km";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLanguage: () => void;
  t: (
    key: string,
    vars?: Record<string, string | number> | undefined,
    forLang?: Lang,
  ) => string;
}

const DICT: Record<string, { en: string; km: string }> = {
  // Navigation
  "nav.overview": { en: "Overview", km: "ទិដ្ឋភាពទូទៅ" },
  "nav.directory": { en: "Personnel", km: "យោធិន" },
  "nav.composer": { en: "New record", km: "បង្កើតប្រវត្តិរូប" },
  "nav.deleted": { en: "Deleted records", km: "ប្រវត្តិរូបដែលបានលុប" },

  // Common
  "common.retry": { en: "Retry", km: "ព្យាយាមម្តងទៀត" },
  "common.back": { en: "Back", km: "ត្រឡប់ក្រោយ" },
  "common.unknownError": { en: "Unknown error", km: "កំហុសមិនស្គាល់" },
  "common.noPosition": { en: "No position", km: "គ្មានតំណែង" },
  "common.noUnit": { en: "No unit", km: "គ្មានកងឯកភាព" },
  "common.search": { en: "Search...", km: "ស្វែងរក..." },
  "common.status": { en: "Status", km: "ស្ថានភាព" },
  "common.remove": { en: "Remove", km: "លុប" },

  // Topbar / layout
  "topbar.searchPlaceholder": {
    en: "Search name / ID / unit...",
    km: "ស្វែងរកឈ្មោះ / ID / កងឯកភាព...",
  },
  "topbar.refresh": { en: "Refresh", km: "ធ្វើបច្ចុប្បន្នភាព" },
  "topbar.dashboard": { en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង" },
  "layout.subtitle": {
    en: "Personal File System",
    km: "ប្រព័ន្ធឯកសារផ្ទាល់ខ្លួន",
  },
  "layout.footer": {
    en: "Soldier personnel records management",
    km: "ប្រព័ន្ធគ្រប់គ្រងប្រវត្តិរូបយោធិន",
  },

  // Overview
  "overview.welcome": { en: "Welcome, Commander", km: "ជំរាបសួរ, លោក មេបញ្ជាការ" },
  "overview.byline": {
    en: "Overview of the soldier personnel records database.",
    km: "ទិដ្ឋភាពទូទៅនៃមូលដ្ឋានទិន្នន័យប្រវត្តិរូបយោធិន។",
  },
  "overview.commandCenter": { en: "Command center", km: "មជ្ឈមណ្ឌលបញ្ជា" },
  "overview.loading": {
    en: "Gathering all personnel profiles...",
    km: "ប្រមូលទិន្នន័យប្រវត្តិរូបទាំងអស់...",
  },
  "overview.loadFailed": {
    en: "Could not load data",
    km: "មិនអាចទាញទិន្នន័យបានទេ",
  },
  "overview.directoryBtn": { en: "Personnel", km: "បញ្ជីយោធិន" },
  "overview.newRecordBtn": { en: "New profile", km: "បង្កើតប្រវត្តិរូបថ្មី" },
  "overview.totalPersonnel": { en: "Total personnel", km: "ចំនួនយោធិន" },
  "overview.totalPersonnelHint": {
    en: "Record in 01_Personnel",
    km: "កំណត់ត្រាក្នុង 01_Personnel",
  },
  "overview.active": { en: "Active", km: "នៅក្នុងការបម្រើ" },
  "overview.activeHint": { en: "Status = ACTIVE", km: "ស្ថានភាព = ACTIVE" },
  "overview.deleted": { en: "Deleted", km: "បានលុប" },
  "overview.deletedHint": {
    en: "Soft-deleted profiles",
    km: "ប្រវត្តិរូបដែលបានលុប",
  },
  "overview.records": { en: "Records", km: "ចំនួនកំណត់ត្រា" },
  "overview.recordsHint": {
    en: "Across all 9 sheets",
    km: "នៅទូទាំង ៩ សន្លឹកទិន្នន័យ",
  },
  "overview.breakdown": { en: "Breakdown", km: "ស្ថានភាពទូទៅ" },
  "overview.breakdownSubtitle": {
    en: "Active vs deleted personnel",
    km: "យោធិនកំពុងបម្រើ និងបានលុប",
  },
  "overview.activeVsDeleted": { en: "Active vs Deleted", km: "បម្រើ និង លុប" },
  "overview.genderSplit": { en: "Gender split", km: "តាមភេទ" },
  "overview.topUnits": { en: "Top units", km: "កងឯកភាព" },
  "overview.rankPosition": { en: "Rank / position", km: "ឋានន្តរស័ក្តិ" },
  "overview.noData": { en: "No data available.", km: "គ្មានទិន្នន័យ។" },
  "overview.sheetsCoverage": { en: "Data sheets", km: "សន្លឹកទិន្នន័យ" },
  "overview.sheetsCoverageSubtitle": {
    en: "Records stored in each of the 9 sheets",
    km: "កំណត់ត្រាដែលរក្សាទុកក្នុងសន្លឹកទាំង ៩",
  },
  "overview.sheets": { en: "sheets", km: "សន្លឹក" },
  "overview.recordsUnit": { en: "records", km: "កំណត់ត្រា" },
  "overview.completeness": { en: "Profile completeness", km: "ភាពពេញលេញនៃប្រវត្តិរូប" },
  "overview.completenessSubtitle": {
    en: "How complete each personnel file is",
    km: "កម្រិតពេញលេញនៃឯកសារប្រវត្តិរូបយោធិន",
  },
  "overview.withFamily": { en: "With family history", km: "មានប្រវត្តិគ្រួសារ" },
  "overview.withFamilyHint": {
    en: "At least one record in 02_Family_Background",
    km: "មានយ៉ាងហោចណាស់មួយកំណត់ត្រាក្នុង 02_Family_Background",
  },
  "overview.completeProfiles": { en: "All 9 sheets complete", km: "ពេញលេញទាំង ៩ សន្លឹក" },
  "overview.completeProfilesHint": {
    en: "Every sheet 02–09 has at least one record",
    km: "សន្លឹក ០២–០៩ មានកំណត់ត្រាយ៉ាងហោចណាស់មួយ",
  },

  // Directory
  "directory.title": { en: "Personnel directory", km: "បញ្ជីឈ្មោះយោធិន" },
  "directory.subtitle": {
    en: "Soldier directory — search by name, ID or unit",
    km: "បញ្ជីឈ្មោះយោធិន — ស្វែងរកតាមឈ្មោះ លេខសម្គាល់ ឬកងឯកភាព",
  },
  "directory.loading": {
    en: "Loading personnel list...",
    km: "កំពុងទាញបញ្ជីយោធិន...",
  },
  "directory.loadFailed": {
    en: "Failed to load personnel",
    km: "បរាជ័យក្នុងការទាញបញ្ជីយោធិន",
  },
  "directory.noResults": { en: "No personnel found", km: "រកមិនឃើញយោធិនទេ" },
  "directory.noResultsDesc": {
    en: "No soldiers match your search criteria",
    km: "គ្មានយោធិនដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរក",
  },
  "directory.filterAll": { en: "All", km: "ទាំងអស់" },
  "directory.showing": { en: "Showing", km: "បង្ហាញ" },
  "directory.onPage": { en: "on page", km: "នៅទំព័រ" },
  "directory.of": { en: "of", km: "ក្នុងចំណោម" },
  "directory.prev": { en: "Prev", km: "មុន" },
  "directory.next": { en: "Next", km: "បន្ទាប់" },
  "directory.result": { en: "result", km: "លទ្ធផល" },
  "directory.page": { en: "Page", km: "ទំព័រ" },
  "directory.viewCards": { en: "Card view", km: "បង្ហាញជាកាត" },
  "directory.viewTable": { en: "Table view", km: "បង្ហាញជាតារាង" },
  "directory.no": { en: "#", km: "ល.រ" },
  "directory.personnelCol": { en: "Personnel", km: "ឈ្មោះយោធិន" },
  "directory.id": { en: "ID", km: "លេខសម្គាល់" },
  "directory.gender": { en: "Gender", km: "ភេទ" },
  "directory.rank": { en: "Rank / position", km: "ឋានន្តរស័ក្តិ" },
  "directory.unit": { en: "Unit", km: "កងឯកភាព" },

  // Profile viewer
  "profile.loading": { en: "Opening profile...", km: "កំពុងបើកប្រវត្តិរូប..." },
  "profile.notFound": { en: "Profile not found", km: "រកមិនឃើញប្រវត្តិរូប" },
  "profile.editPersonnel": { en: "Edit personnel", km: "កែសម្រួលឯកសារ" },
  "profile.softDelete": { en: "Delete", km: "លុប" },
  "profile.deleting": { en: "Deleting...", km: "កំពុងលុប..." },
  "profile.deleteFailed": { en: "Delete failed", km: "ការលុបបរាជ័យ" },
  "profile.deleteConfirmTitle": { en: "Delete profile?", km: "លុបប្រវត្តិរូបនេះ?" },
  "profile.deleteConfirmMessage": {
    en: "The profile of \"{name}\" will be moved to deleted records. It can be restored later.",
    km: "ប្រវត្តិរូបរបស់ \"{name}\" នឹងត្រូវផ្លាស់ទៅក្នុងប្រវត្តិរូបដែលបានលុប។ វាអាចត្រូវបានស្តារនៅពេលក្រោយ។",
  },
  "common.cancel": { en: "Cancel", km: "បោះបង់" },
  "common.confirm": { en: "Confirm", km: "យល់ព្រម" },
  "profile.otherInfo": { en: "Other details", km: "ព័ត៌មានផ្សេងទៀត" },
  "profile.recordColumn": { en: "Record", km: "កំណត់ត្រា" },
  "profile.statusColumn": { en: "Status", km: "ស្ថានភាព" },
  "profile.noRecords": {
    en: "No records in sheet {sheet} yet",
    km: "មិនទាន់មានកំណត់ត្រាក្នុងសន្លឹក {sheet} ទេ",
  },
  "profile.sectionPersonnel": { en: "01 · Personnel", km: "01 · ព័ត៌មានផ្ទាល់ខ្លួន" },

  // Composer / form
  "form.editBanner": {
    en: "Editing sheet 01_Personnel of {id}. Related sheets (02–09) are read-only in this view.",
    km: "កំពុងកែសម្រួលសន្លឹក 01_Personnel របស់ {id}។ សន្លឹកដែលពាក់ព័ន្ធ (02–09) មិនអាចកែសម្រួលក្នុងទិដ្ឋភាពនេះបានទេ។",
  },
  "form.createBanner": {
    en: "Create a brand-new profile — fill 01_Personnel (required), then add sheets 02 to 09 as needed.",
    km: "បង្កើតប្រវត្តិរូបថ្មីទាំងស្រុង — បំពេញ 01_Personnel ជាចាំបាច់ ហើយអាចបន្ថែមសន្លឹកប្រវត្តិរូបផ្សេងទៀតពី ០២ ដល់ ០៩។",
  },
  "form.savedUpdate": {
    en: "Updated sheet 01_Personnel successfully",
    km: "បានធ្វើបច្ចុប្បន្នភាពសន្លឹក 01_Personnel ដោយជោគជ័យ",
  },
  "form.savedCreate": {
    en: "Saved new profile and all sheets",
    km: "បានរក្សាទុកប្រវត្តិរូបថ្មី និងសន្លឹកទិន្នន័យទាំងអស់",
  },
  "form.saveFailed": { en: "Save failed", km: "ការរក្សាទុកបរាជ័យ" },
  "form.saving": { en: "Saving...", km: "កំពុងរក្សាទុក..." },
  "form.updatePersonnel": { en: "Update 01_Personnel", km: "ធ្វើបច្ចុប្បន្នភាព 01_Personnel" },
  "form.saveProfile": { en: "Save profile", km: "រក្សាទុកប្រវត្តិរូប" },
  "form.recordsCount": { en: "{n} record(s)", km: "{n} កំណត់ត្រា" },
  "form.autoId": { en: "Auto-generated ID", km: "បង្កើត ID ដោយស្វ័យប្រវត្តិ" },
  "form.addRecord": { en: "Add record", km: "បន្ថែមកំណត់ត្រា" },
  "form.noRecordsYet": {
    en: "No records yet — click “Add record” to start",
    km: "មិនទាន់មានកំណត់ត្រាទេ — ចុច “បន្ថែមកំណត់ត្រា” ដើម្បីចាប់ផ្តើម",
  },
  "form.recordNo": { en: "Record #{n}", km: "កំណត់ត្រា #{n}" },
  "form.personnelSheetDesc": {
    en: "Soldier personal information",
    km: "ព័ត៌មានផ្ទាល់ខ្លួនយោធិន",
  },
  "form.generateLink": {
    en: "Generate link",
    km: "បង្កើតតំណភ្ជាប់",
  },
  "form.generatingLink": { en: "Generating...", km: "កំពុងបង្កើត..." },
  "form.registerInviteTitle": {
    en: "Self-registration link",
    km: "តំណភ្ជាប់សម្រាប់ចុះឈ្មោះដោយខ្លួនឯង",
  },
  "form.registerInviteDesc": {
    en: "Generate a one-time link so the soldier can fill in all 9 sheets themselves.",
    km: "បង្កើតតំណប្រើបានតែម្តង ដើម្បីឱ្យយោធិនបំពេញសន្លឹកទាំង ៩ ដោយខ្លួនឯង។",
  },
  "form.shareThisLink": {
    en: "Share this link",
    km: "ចែករំលែកតំណនេះ",
  },
  "form.copyLink": { en: "Copy", km: "ចម្លង" },
  "form.linkCopied": { en: "Copied!", km: "បានចម្លង!" },
  "form.openPreview": {
    en: "Open preview",
    km: "បើកមើលជាមុន",
  },
  "form.allSheetsRequired": {
    en: "Fill in at least one field in every sheet to enable Save — missing:",
    km: "សូមបំពេញយ៉ាងតិចមួយវាលក្នុងគ្រប់សន្លឹក ដើម្បីអាចរក្សាទុក — ខ្វះ៖",
  },
  "form.prevSheet": { en: "Prev", km: "មុន" },
  "form.nextSheet": { en: "Next", km: "បន្ទាប់" },
  "form.updateSheet": {
    en: "Update sheet",
    km: "ធ្វើបច្ចុប្បន្នភាពសន្លឹក",
  },
  "form.updateAll": {
    en: "Update all",
    km: "ធ្វើបច្ចុប្បន្នភាពទាំងអស់",
  },

  // Self-registration page
  "register.title": {
    en: "Self registration",
    km: "ចុះឈ្មោះដោយខ្លួនឯង",
  },
  "register.subtitle": {
    en: "Fill in your personnel record sheets below.",
    km: "សូមបំពេញសន្លឹកប្រវត្តិរូបរបស់អ្នកខាងក្រោម។",
  },
  "register.pageTitle": {
    en: "Self registration — បង្កើតប្រវត្តិរូប",
    km: "ចុះឈ្មោះដោយខ្លួនឯង — Self registration",
  },
  "register.loading": {
    en: "Validating your registration link...",
    km: "កំពុងផ្ទៀងផ្ទាត់តំណចុះឈ្មោះ...",
  },
  "register.missingError": {
    en: "Missing registration link",
    km: "ខ្វះតំណចុះឈ្មោះ",
  },
  "register.missingErrorDesc": {
    en: "Open the link that was shared with you to register.",
    km: "សូមបើកតំណដែលបានចែកជូនអ្នក ដើម្បីចុះឈ្មោះ។",
  },
  "register.invalidError": {
    en: "This registration link is not valid",
    km: "តំណចុះឈ្មោះនេះមិនត្រឹមត្រូវទេ",
  },
  "register.invalidErrorDesc": {
    en: "Please contact the administrator to get a new link.",
    km: "សូមទាក់ទងអ្នកគ្រប់គ្រង ដើម្បីទទួលបានតំណថ្មី។",
  },
  "register.usedError": {
    en: "This registration link has already been used",
    km: "តំណចុះឈ្មោះនេះត្រូវបានប្រើប្រាស់រួចហើយ",
  },
  "register.usedErrorDesc": {
    en: "Each link can only be used once.",
    km: "តំណនីមួយៗអាចប្រើបានតែម្តងប៉ុណ្ណោះ។",
  },
  "register.backHome": {
    en: "Back to home",
    km: "ត្រឡប់ទៅទំព័រដើម",
  },
  "register.submittedTitle": {
    en: "Submitted successfully",
    km: "បានដាក់ស្នើដោយជោគជ័យ",
  },
  "register.submittedDesc": {
    en: "Your personnel records have been saved. You can now close this page.",
    km: "ប្រវត្តិរូបរបស់អ្នកត្រូវបានរក្សាទុកដោយជោគជ័យ។ អ្នកអាចបិទទំព័រនេះបានឥឡូវនេះ។",
  },

  // Dashboard composer view
  "dashboard.editTitle": { en: "Edit personnel record", km: "កែសម្រួលប្រវត្តិរូបយោធិន" },
  "dashboard.createTitle": { en: "Create new profile", km: "បង្កើតប្រវត្តិរូបថ្មី" },
  "dashboard.editSubtitle": {
    en: "Editing sheet 01_Personnel of {id}",
    km: "កំពុងកែសម្រួលសន្លឹក 01_Personnel របស់ {id}",
  },
  "dashboard.createSubtitle": {
    en: "Create a new soldier profile with the related data sheets",
    km: "បង្កើតប្រវត្តិរូបយោធិនថ្មីជាមួយសន្លឹកទិន្នន័យពាក់ព័ន្ធ",
  },
  "dashboard.loadingProfile": {
    en: "Loading profile...",
    km: "កំពុងផ្ទុកប្រវត្តិរូប...",
  },
  "dashboard.loadFailed": {
    en: "Failed to load profile",
    km: "បរាជ័យក្នុងការផ្ទុកប្រវត្តិរូប",
  },
  "dashboard.createMode": { en: "Create mode", km: "របៀបបង្កើតថ្មី" },

  // Deleted records
  "deleted.loading": {
    en: "Loading deleted profiles...",
    km: "កំពុងទាញប្រវត្តិរូបដែលបានលុប...",
  },
  "deleted.loadFailed": { en: "Failed to load", km: "បរាជ័យក្នុងការផ្ទុក" },
  "deleted.title": { en: "Deleted records", km: "ប្រវត្តិរូបដែលបានលុប" },
  "deleted.subtitle": {
    en: "Soft-deleted profiles — can be restored",
    km: "ប្រវត្តិរូបដែលបានលុប — អាចស្តារឡើងវិញបាន",
  },
  "deleted.emptyTitle": { en: "No deleted profiles", km: "គ្មានប្រវត្តិរូបដែលបានលុប" },
  "deleted.emptyDesc": {
    en: "Deleted profiles will appear here",
    km: "ប្រវត្តិរូបដែលបានលុបនឹងបង្ហាញនៅទីនេះ",
  },
  "deleted.restore": { en: "Restore", km: "ស្តារ" },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "makara.lang";

function initialLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "km" ? "km" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((value: Lang) => {
    setLangState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLanguage = useCallback(
    () => setLang(lang === "en" ? "km" : "en"),
    [lang, setLang],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>, forLang?: Lang) => {
      const target = forLang ?? lang;
      const entry = DICT[key];
      let text = entry ? entry[target] : key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.split(`{${name}}`).join(String(value));
        }
      }
      return text;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLanguage, t }),
    [lang, setLang, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}