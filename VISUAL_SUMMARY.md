# Visual Summary: Leave and Holiday Display

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HRMS HOME PAGE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 👥 Total │  │ 🔔 Pending│  │ 💰 Org   │  │ 🎂 Events│          │
│  │ Employees│  │ Leaves   │  │ Payroll  │  │          │          │
│  │   50     │  │    5     │  │ 250,000  │  │    3     │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🏖️ Who's on Leave Today                          [3 people]       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │ 👤              │  │ 👤              │  │ 👤              │   │
│  │ John Doe        │  │ Jane Smith      │  │ Bob Johnson     │   │
│  │ Apr 29 - May 2  │  │ Apr 29 - Apr 29 │  │ Apr 29 - May 1  │   │
│  │ [Sick Leave]    │  │ [Casual Leave]  │  │ [Annual Leave]  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                     │
│                    View all 3 employees on leave →                 │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🎉 Upcoming Holidays                                              │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │ ┌──┐                                                       │    │
│  │ │01│  Labor Day                              Friday       │    │
│  │ │May│  International Workers' Day                         │    │
│  │ └──┘                                                       │    │
│  └───────────────────────────────────────────────────────────┘    │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │ ┌──┐                                                       │    │
│  │ │04│  Independence Day                       Saturday     │    │
│  │ │Jul│  National Holiday                                   │    │
│  │ └──┘                                                       │    │
│  └───────────────────────────────────────────────────────────┘    │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │ ┌──┐                                                       │    │
│  │ │25│  Christmas                              Friday       │    │
│  │ │Dec│  Public Holiday                                     │    │
│  │ └──┘                                                       │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [REST OF HOME PAGE - Employee Directory, Charts, etc.]            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Leave Section:
- **Border**: Blue (#3b82f6)
- **Count Badge**: Light blue background (#dbeafe), dark blue text (#1e40af)
- **Cards**: Light gray background (#f8fafc), gray border (#e2e8f0)
- **Avatar Border**: Blue (#3b82f6)
- **Leave Type Badge**: Light blue background (#e0f2fe), dark blue text (#0369a1)
- **Hover**: Darker gray (#f1f5f9), shadow effect

### Holiday Section:
- **Border**: Orange (#f59e0b)
- **Cards**: Yellow gradient (#fef3c7 to #fde68a), orange border (#fbbf24)
- **Date Box**: White background, orange border (#f59e0b)
- **Text**: Brown shades (#78350f, #92400e, #b45309)
- **Hover**: Slide right animation, orange shadow

## 📱 Responsive Behavior

### Desktop (> 1200px):
```
Leave Cards: 3 columns
Holiday Cards: Full width
```

### Tablet (768px - 1200px):
```
Leave Cards: 2 columns
Holiday Cards: Full width
```

### Mobile (< 768px):
```
Leave Cards: 1 column
Holiday Cards: Full width
```

## 🎭 Empty States

### No Leaves:
```
┌─────────────────────────────────────────┐
│  🏖️ Who's on Leave Today                │
│                                         │
│              ✅                          │
│                                         │
│      Everyone is present today!         │
│      No approved leaves for today       │
│                                         │
└─────────────────────────────────────────┘
```

### No Holidays:
```
┌─────────────────────────────────────────┐
│  🎉 Upcoming Holidays                   │
│                                         │
│              📅                          │
│                                         │
│        No upcoming holidays             │
│     Check back later for holiday        │
│              updates                    │
│                                         │
└─────────────────────────────────────────┘
```

## 🎯 Interactive Elements

### Leave Card Hover:
```
Before:                    After:
┌─────────────────┐       ┌─────────────────┐
│ 👤              │       │ 👤              │ ↑ (lifted)
│ John Doe        │  →    │ John Doe        │ 
│ Apr 29 - May 2  │       │ Apr 29 - May 2  │ (shadow)
│ [Sick Leave]    │       │ [Sick Leave]    │
└─────────────────┘       └─────────────────┘
```

### Holiday Card Hover:
```
Before:                    After:
┌──────────────────┐       ┌──────────────────┐
│ ┌──┐             │       │ ┌──┐             │ → (slide right)
│ │01│ Labor Day   │  →    │ │01│ Labor Day   │
│ │May│ ...         │       │ │May│ ...         │ (shadow)
│ └──┘             │       │ └──┘             │
└──────────────────┘       └──────────────────┘
```

### View All Link:
```
Normal:                    Hover:
View all 3 employees →     View all 3 employees →
(blue text)                (darker blue + underline)
```

## 📊 Data Display Examples

### Leave Dates Formatting:
```
Input:  "2026-04-29" to "2026-05-02"
Output: "Apr 29 - May 2"

Input:  "2026-04-29" to "2026-04-29"
Output: "Apr 29 - Apr 29"
```

### Holiday Date Formatting:
```
Input:  "2026-05-01"
Output: 
  Day: "1"
  Month: "May"
  Weekday: "Friday"
```

### Leave Type Badge:
```
Input:  "Sick Leave"
Output: [Sick Leave] (blue badge)

Input:  "Casual Leave"
Output: [Casual Leave] (blue badge)

Input:  "Annual Leave"
Output: [Annual Leave] (blue badge)
```

## 🔄 Role-Based Views

### Admin View:
```
🏖️ Who's on Leave Today                    [5 people]
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ John (IT)   │ │ Jane (HR)   │ │ Bob (Sales) │
│ Apr 29-30   │ │ Apr 29      │ │ Apr 29-May1 │
└─────────────┘ └─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐
│ Alice (IT)  │ │ Tom (HR)    │
│ Apr 29-May2 │ │ Apr 29      │
└─────────────┘ └─────────────┘

Shows: ALL employees on leave
```

### Manager View (IT Department):
```
🏖️ Who's on Leave Today                    [2 people]
┌─────────────┐ ┌─────────────┐
│ John (IT)   │ │ Alice (IT)  │
│ Apr 29-30   │ │ Apr 29-May2 │
└─────────────┘ └─────────────┘

Shows: Only IT department employees on leave
```

### Employee View:
```
🏖️ Who's on Leave Today                    [1 person]
┌─────────────┐
│ John (IT)   │
│ Apr 29-30   │
└─────────────┘

Shows: Only own leave (if on leave today)
```

## 🎨 Typography

### Headers:
- **Section Title**: 16px, Semi-bold (600), Dark gray (#1f2937)
- **Card Name**: 14px, Semi-bold (600), Dark gray (#1f2937)
- **Holiday Title**: 15px, Semi-bold (600), Brown (#78350f)

### Body Text:
- **Leave Dates**: 12px, Medium (500), Gray (#64748b)
- **Holiday Description**: 13px, Regular (400), Brown (#92400e)
- **Day of Week**: 13px, Semi-bold (600), Brown (#b45309)

### Badges:
- **Count Badge**: 12px, Semi-bold (600)
- **Leave Type Badge**: 11px, Semi-bold (600), Capitalized

## 🎯 Spacing

### Section Spacing:
- **Between KPI and Leave**: 16px
- **Between Leave and Holiday**: 16px
- **Between Holiday and Main Grid**: 16px

### Card Spacing:
- **Leave Cards Gap**: 12px
- **Holiday Cards Gap**: 12px
- **Card Padding**: 12-14px

### Internal Spacing:
- **Avatar to Text**: 12px
- **Title to Dates**: 4px
- **Dates to Badge**: 6px

## ✨ Animations

### Hover Transitions:
```css
/* Leave Card */
transition: all 0.2s ease;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0,0,0,0.08);

/* Holiday Card */
transition: all 0.2s ease;
transform: translateX(4px);
box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);

/* View All Link */
transition: color 0.2s ease;
text-decoration: underline;
```

## 🎨 Keka-Inspired Design Elements

1. **Clean Cards**: Minimal borders, subtle shadows
2. **Color Coding**: Blue for leaves, Yellow/Orange for holidays
3. **Avatar Circles**: Colorful, random backgrounds
4. **Badge System**: Small, rounded badges for categories
5. **Empty States**: Friendly icons and messages
6. **Hover Effects**: Subtle lift and shadow
7. **Responsive Grid**: Auto-adjusting columns
8. **Typography**: Clear hierarchy, readable sizes

## 📐 Dimensions

### Leave Cards:
- **Min Width**: 200px
- **Avatar Size**: 48px × 48px
- **Card Height**: Auto (based on content)
- **Border Radius**: 10px

### Holiday Cards:
- **Width**: 100%
- **Date Box**: 60px × 60px
- **Card Height**: Auto
- **Border Radius**: 10px

### Badges:
- **Count Badge**: Auto width, 24px height
- **Leave Type Badge**: Auto width, 20px height
- **Border Radius**: 12px (count), 4px (leave type)

This implementation provides a modern, clean, and professional look similar to Keka HR application! 🎉
