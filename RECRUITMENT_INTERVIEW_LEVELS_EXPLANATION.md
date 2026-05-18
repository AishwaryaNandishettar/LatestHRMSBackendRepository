# Recruitment Interview Levels Implementation (L1, L2, L3, L4)

## Overview
The recruitment system now supports **4 interview levels** instead of just 2. This allows for a more structured and comprehensive candidate evaluation process.

---

## Interview Level Definitions

### **L1 - Screening Interview**
- **Purpose**: Initial screening of candidates
- **Conducted By**: HR/Recruiter
- **Duration**: 15-20 minutes
- **Focus**: Resume verification, basic qualifications, communication skills
- **Outcome**: Pass/Fail to proceed to L2

### **L2 - Technical Interview**
- **Purpose**: Assess technical skills and domain knowledge
- **Conducted By**: Technical Lead/Senior Developer
- **Duration**: 45-60 minutes
- **Focus**: Technical competency, problem-solving, relevant experience
- **Outcome**: Pass/Fail to proceed to L3

### **L3 - Manager Interview** (NEW)
- **Purpose**: Assess management fit, team compatibility, and soft skills
- **Conducted By**: Direct Manager/Department Head
- **Duration**: 30-45 minutes
- **Focus**: Leadership potential, team collaboration, cultural fit
- **Outcome**: Pass/Fail to proceed to L4

### **L4 - Executive Interview** (NEW)
- **Purpose**: Final approval and strategic fit assessment
- **Conducted By**: Executive/Director/C-Level
- **Duration**: 20-30 minutes
- **Focus**: Strategic alignment, long-term potential, final decision
- **Outcome**: Approved for offer or Rejected

---

## How It Works in the System

### **1. Interview Level Selection**
When you set a job to "Interview Stage", you now select which level the candidate is at:

```
┌─────────────────────────────────────┐
│  Interview Level Selection          │
├─────────────────────────────────────┤
│  ☐ L1 - Screening                   │
│  ☐ L2 - Technical                   │
│  ☐ L3 - Manager          (NEW)      │
│  ☐ L4 - Executive        (NEW)      │
└─────────────────────────────────────┘
```

### **2. Date Tracking**
Each level has its own interview date field:

```
Applied Date:        [mm/dd/yyyy]  ← When candidate applied
L1 Interview Date:   [mm/dd/yyyy]  ← Screening interview
L2 Interview Date:   [mm/dd/yyyy]  ← Technical interview
L3 Interview Date:   [mm/dd/yyyy]  ← Manager interview (NEW)
L4 Interview Date:   [mm/dd/yyyy]  ← Executive interview (NEW)
Offer Date:          [mm/dd/yyyy]  ← When offer is made
Onboarding Date:     [mm/dd/yyyy]  ← When candidate joins
```

### **3. Pipeline Flow**
```
Applied
   ↓
L1 Screening (HR)
   ↓
L2 Technical (Tech Lead)
   ↓
L3 Manager (Manager)        ← NEW
   ↓
L4 Executive (Executive)    ← NEW
   ↓
Selected → Offer → Onboarding
```

---

## Code Implementation Details

### **Frontend Changes (Recruitment.jsx)**

#### 1. **Interview Level Buttons** (4 levels instead of 2)
```javascript
{['L1', 'L2', 'L3', 'L4'].map(level => (
  <button key={level}
    onClick={() => setPipelineForm(f => ({ ...f, interviewLevel: level }))}>
    {level === 'L1' ? 'L1 - Screening' : 
     level === 'L2' ? 'L2 - Technical' : 
     level === 'L3' ? 'L3 - Manager' : 
     'L4 - Executive'}
  </button>
))}
```

**What it does:**
- Displays 4 buttons for each interview level
- Each button has a descriptive label
- User clicks to select the current interview level
- Selected button is highlighted in blue

#### 2. **Date Input Fields** (6 interview dates)
```javascript
// Applied Date
<input type="date" value={pipelineForm.appliedDate} />

// L1 Interview Date
<input type="date" value={pipelineForm.l1InterviewDate} />

// L2 Interview Date
<input type="date" value={pipelineForm.l2InterviewDate} />

// L3 Interview Date (NEW)
<input type="date" value={pipelineForm.l3InterviewDate || ''} />

// L4 Interview Date (NEW)
<input type="date" value={pipelineForm.l4InterviewDate || ''} />

// Offer Date
<input type="date" value={pipelineForm.offerDate} />

// Onboarding Date
<input type="date" value={pipelineForm.onboardingDate} />
```

**What it does:**
- Each date field stores when that interview level occurred
- L3 and L4 dates are optional (use `|| ''` to default to empty)
- Dates are sent to backend when "Save Pipeline Details" is clicked

#### 3. **Level Badge Display**
```javascript
{job.status === 'Interview Stage' && job.interviewLevel && (
  <span>
    {job.interviewLevel === 'L1' ? 'L1 - Screening' : 
     job.interviewLevel === 'L2' ? 'L2 - Technical' : 
     job.interviewLevel === 'L3' ? 'L3 - Manager' : 
     'L4 - Executive'}
  </span>
)}
```

**What it does:**
- Shows which interview level the candidate is currently at
- Displays below the HR Action dropdown
- Color-coded (yellow background for visibility)

#### 4. **Form State Initialization**
```javascript
const [pipelineForm, setPipelineForm] = useState({
  status: '', 
  interviewLevel: '', 
  selectionLevel: '',
  appliedDate: '', 
  l1InterviewDate: '', 
  l2InterviewDate: '', 
  l3InterviewDate: '',      // NEW
  l4InterviewDate: '',      // NEW
  offerDate: '', 
  onboardingDate: ''
});
```

**What it does:**
- Initializes form with all 4 interview date fields
- When modal opens, these fields are populated from job data
- When user saves, all dates are sent to backend

---

## Data Flow Example

### **Scenario: Candidate progresses through all 4 levels**

1. **Day 1 - Applied**
   - Status: "Searching Profile"
   - Applied Date: 2026-05-07

2. **Day 3 - L1 Screening**
   - Status: "Interview Stage"
   - Interview Level: L1
   - L1 Interview Date: 2026-05-09
   - HR conducts screening → Candidate passes

3. **Day 5 - L2 Technical**
   - Status: "Interview Stage"
   - Interview Level: L2
   - L2 Interview Date: 2026-05-11
   - Tech Lead conducts technical interview → Candidate passes

4. **Day 7 - L3 Manager** (NEW)
   - Status: "Interview Stage"
   - Interview Level: L3
   - L3 Interview Date: 2026-05-13
   - Manager conducts manager interview → Candidate passes

5. **Day 9 - L4 Executive** (NEW)
   - Status: "Interview Stage"
   - Interview Level: L4
   - L4 Interview Date: 2026-05-15
   - Executive conducts final interview → Candidate passes

6. **Day 10 - Selected**
   - Status: "Selected"
   - Offer Date: 2026-05-16

7. **Day 20 - Onboarding**
   - Onboarding Date: 2026-05-26
   - Candidate joins company

---

## Backend Integration (No Changes Required)

The backend already supports storing these fields:
- `l1InterviewDate` ✅
- `l2InterviewDate` ✅
- `l3InterviewDate` ✅ (NEW - will be stored)
- `l4InterviewDate` ✅ (NEW - will be stored)

When you click "Save Pipeline Details", the form sends:
```json
{
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

The backend's `updateJob()` endpoint saves all these fields to MongoDB.

---

## Key Features Preserved (No Breaking Changes)

✅ **Existing L1 & L2 logic unchanged** - All current functionality works as before
✅ **Selection Level still works** - For "Selected" status
✅ **Date tracking** - All dates are optional and tracked separately
✅ **UI responsive** - Buttons wrap on smaller screens (flex: 1 1 calc(50% - 5px))
✅ **Validation** - Still requires selecting a level before saving
✅ **Badge display** - Shows current level with descriptive text

---

## Usage Instructions

### **For HR/Recruiters:**

1. **Create a Job** → Click "+ Post Job"
2. **Receive Applications** → Job status shows "Searching Profile"
3. **Start Interview Process** → Change status to "Interview Stage"
4. **Select L1** → Click "L1 - Screening" button
5. **Enter L1 Date** → Set interview date
6. **Save** → Click "✓ Save Pipeline Details"
7. **After L1 Passes** → Change Interview Level to "L2"
8. **Repeat for L2, L3, L4** → Follow same process
9. **Final Selection** → Change status to "Selected"
10. **Send Offer** → Set Offer Date
11. **Onboard** → Set Onboarding Date

### **For Managers/Executives:**

- View candidate's current interview level in the table
- See all interview dates in the pipeline modal
- Approve or reject at your assigned level (L3 for Managers, L4 for Executives)

---

## Benefits of 4-Level Interview System

| Aspect | Benefit |
|--------|---------|
| **Thoroughness** | Multiple perspectives (HR, Tech, Manager, Executive) |
| **Risk Reduction** | Fewer bad hires due to comprehensive evaluation |
| **Time Tracking** | Know exactly when each interview happened |
| **Transparency** | Candidates see clear progression path |
| **Scalability** | Works for startups (skip L3/L4) or enterprises (use all 4) |
| **Data-Driven** | Track which levels have highest pass rates |

---

## Troubleshooting

**Q: L3 and L4 dates not showing?**
A: They default to empty strings. They'll appear once you enter a date.

**Q: Can I skip levels?**
A: Yes! You can go directly from L1 to L3 if needed. Just select the level you want.

**Q: What if I need to go back to L2?**
A: Change the Interview Level dropdown back to L2 and update the date.

**Q: Are L3 and L4 mandatory?**
A: No, they're optional. Use only what you need.

---

## Summary

✅ **Added 2 new interview levels** (L3 - Manager, L4 - Executive)
✅ **Added 2 new date fields** (l3InterviewDate, l4InterviewDate)
✅ **Updated UI** to show 4 level buttons with descriptions
✅ **Preserved all existing logic** - No breaking changes
✅ **Backward compatible** - Old jobs still work with L1/L2
✅ **Ready for production** - No backend changes needed
