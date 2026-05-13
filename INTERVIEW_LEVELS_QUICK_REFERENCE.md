# Interview Levels Quick Reference

## The 4 Interview Levels

```
┌─────────────────────────────────────────────────────────────┐
│                    RECRUITMENT PIPELINE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Applied → L1 → L2 → L3 → L4 → Selected → Offer → Join    │
│           ↓    ↓    ↓    ↓                                  │
│          HR   Tech  Mgr  Exec                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Level Details

| Level | Name | Conducted By | Duration | Focus | Pass Rate |
|-------|------|--------------|----------|-------|-----------|
| **L1** | Screening | HR/Recruiter | 15-20 min | Resume, basics, communication | ~70% |
| **L2** | Technical | Tech Lead | 45-60 min | Technical skills, problem-solving | ~50% |
| **L3** | Manager | Manager | 30-45 min | Team fit, soft skills, leadership | ~60% |
| **L4** | Executive | Executive | 20-30 min | Strategic fit, final approval | ~80% |

## What Changed

### Before (2 Levels)
```
Interview Level: [L1] [L2]
Dates: Applied, L1 Date, L2 Date, Offer, Onboarding
```

### After (4 Levels) ✨
```
Interview Level: [L1] [L2] [L3] [L4]
Dates: Applied, L1 Date, L2 Date, L3 Date, L4 Date, Offer, Onboarding
```

## Code Changes Summary

### 1. Interview Level Buttons
```javascript
// OLD: 2 buttons
{['L1', 'L2'].map(level => ...)}

// NEW: 4 buttons with descriptions
{['L1', 'L2', 'L3', 'L4'].map(level => (
  <button>
    {level === 'L1' ? 'L1 - Screening' : 
     level === 'L2' ? 'L2 - Technical' : 
     level === 'L3' ? 'L3 - Manager' : 
     'L4 - Executive'}
  </button>
))}
```

### 2. Date Fields
```javascript
// OLD: 4 date fields
appliedDate, l1InterviewDate, l2InterviewDate, offerDate

// NEW: 6 date fields
appliedDate, l1InterviewDate, l2InterviewDate, 
l3InterviewDate, l4InterviewDate, offerDate
```

### 3. Form State
```javascript
// OLD
const [pipelineForm, setPipelineForm] = useState({
  appliedDate: '', l1InterviewDate: '', l2InterviewDate: '',
  offerDate: '', onboardingDate: ''
});

// NEW
const [pipelineForm, setPipelineForm] = useState({
  appliedDate: '', l1InterviewDate: '', l2InterviewDate: '',
  l3InterviewDate: '', l4InterviewDate: '',  // ← NEW
  offerDate: '', onboardingDate: ''
});
```

## How to Use

### Step 1: Create Job
```
Click "+ Post Job" → Fill details → Save
```

### Step 2: Start Interview Process
```
Status: "Searching Profile" → Change to "Interview Stage"
```

### Step 3: Select Interview Level
```
Modal opens → Click "L1 - Screening" → Enter date → Save
```

### Step 4: Progress Through Levels
```
After L1 passes → Change to "L2 - Technical" → Enter date → Save
After L2 passes → Change to "L3 - Manager" → Enter date → Save
After L3 passes → Change to "L4 - Executive" → Enter date → Save
```

### Step 5: Make Offer
```
Status: "Interview Stage" → Change to "Selected" → Enter offer date
```

### Step 6: Onboard
```
Enter onboarding date → Candidate joins company
```

## Data Stored in Database

```json
{
  "_id": "job123",
  "jobTitle": "Senior Developer",
  "status": "Interview Stage",
  "interviewLevel": "L3",
  "appliedDate": "2026-05-07",
  "l1InterviewDate": "2026-05-09",
  "l2InterviewDate": "2026-05-11",
  "l3InterviewDate": "2026-05-13",
  "l4InterviewDate": "",
  "offerDate": "",
  "onboardingDate": ""
}
```

## UI Display

### In Table
```
Job ID | Title | Dept | HR Action | Status | Level Badge
JOB-001| Dev   | IT   | [Dropdown]| Interview | L3 - Manager
```

### In Modal
```
┌─────────────────────────────────────┐
│ Interview Stage Details             │
├─────────────────────────────────────┤
│ Interview Level *                   │
│ [L1-Screening] [L2-Technical]       │
│ [L3-Manager]   [L4-Executive]       │
│                                     │
│ 📅 Applied Date:    [mm/dd/yyyy]   │
│ 🎯 L1 Interview:    [mm/dd/yyyy]   │
│ 🎯 L2 Interview:    [mm/dd/yyyy]   │
│ 🎯 L3 Interview:    [mm/dd/yyyy]   │
│ 🎯 L4 Interview:    [mm/dd/yyyy]   │
│ 📄 Offer Date:      [mm/dd/yyyy]   │
│ 🚀 Onboarding:      [mm/dd/yyyy]   │
│                                     │
│ [Cancel] [✓ Save Pipeline Details]  │
└─────────────────────────────────────┘
```

## Key Points

✅ **No breaking changes** - Old jobs still work
✅ **Optional levels** - Use only what you need
✅ **Flexible** - Can skip levels if needed
✅ **Trackable** - Each level has its own date
✅ **Scalable** - Works for any company size
✅ **Backend ready** - No backend changes needed

## Common Scenarios

### Scenario 1: Fast-track candidate (skip L3)
```
L1 (Pass) → L2 (Pass) → L4 (Pass) → Selected
```

### Scenario 2: Reject at L2
```
L1 (Pass) → L2 (Fail) → Status: Rejected
```

### Scenario 3: Full process
```
L1 (Pass) → L2 (Pass) → L3 (Pass) → L4 (Pass) → Selected → Offer → Onboard
```

### Scenario 4: Startup (only L1 & L2)
```
L1 (Pass) → L2 (Pass) → Selected → Offer → Onboard
```

## Questions?

**Q: Can I edit dates after saving?**
A: Yes, just change the Interview Level and update dates.

**Q: What if candidate fails at L3?**
A: Change status to "Rejected" and move on.

**Q: Do I have to use all 4 levels?**
A: No, use only what fits your process.

**Q: Can I go back to L2 from L3?**
A: Yes, just change the Interview Level dropdown.

**Q: Are dates mandatory?**
A: No, they're optional. Fill only what you need.
