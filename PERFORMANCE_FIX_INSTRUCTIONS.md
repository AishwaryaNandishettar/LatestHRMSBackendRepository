# Performance Management Fix - Instructions

## Problem
- Manager (Padmanabh) sees "No Performance Data" even after clicking "Seed Data"
- Employee (Mahesh) sees "No Performance Data"
- Tracking table shows mock/random data instead of real performance records

## Root Cause
1. Backend seeding might not be creating records properly (need to check logs)
2. Frontend tracking table uses mock data instead of fetching real performance records
3. Frontend doesn't reload all performance data after seeding

## Backend Fix (Already Applied)
Added extensive debug logging to `PerformanceService.seedSampleData()` to track:
- Which role is calling the seed endpoint
- How many team members are found
- Which employees are being processed
- Whether records are created successfully

## Frontend Fixes Needed

### 1. Add state for all performance data
In `Performance.jsx`, line ~40, ADD this state:
```javascript
const [allPerformanceData, setAllPerformanceData] = useState([]); // Store all performance records
```

### 2. Load all performance data on mount
In the `useEffect` that loads employees (around line 80), ADD this at the end before `finally`:
```javascript
        // Load all performance data for the tracking table
        if (!isEmployee) {
          try {
            const allPerf = await getAllPerformance();
            setAllPerformanceData(Array.isArray(allPerf) ? allPerf : []);
          } catch (e) {
            console.error("Failed to load all performance data:", e);
            setAllPerformanceData([]);
          }
        }
```

### 3. Reload performance data after seeding
In `handleSeedData` function (around line 120), ADD this after the existing refresh:
```javascript
      // Reload all performance data for tracking table
      if (!isEmployee) {
        const allPerf = await getAllPerformance();
        setAllPerformanceData(Array.isArray(allPerf) ? allPerf : []);
      }
```

### 4. Replace mock data in tracking table with real data
In the tracking table (around line 420-480), REPLACE these lines:
```javascript
                // Mock performance data for display (in real app, you'd fetch all performance records)
                const mockScore = 3.2 + (Math.random() * 1.6);
                const mockBand = getBand(mockScore);
                const mockLastReview = ["Q3 2024", "Q4 2024", "Nov 2024"][Math.floor(Math.random() * 3)];
```

WITH:
```javascript
                // Find actual performance data for this employee
                const empPerf = allPerformanceData.find(p => p.employeeId === eid);
                const hasData = !!empPerf;
                const actualScore = empPerf?.overallScore || 0;
                const actualBand = hasData ? getBand(actualScore) : "No Data";
                const lastReview = empPerf?.reviews && empPerf.reviews.length > 0 
                  ? empPerf.reviews[empPerf.reviews.length - 1].quarter 
                  : "—";
```

AND REPLACE:
```javascript
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <StarRating value={mockScore} />
                      </div>
                    </td>
```

WITH:
```javascript
                    <td style={{ textAlign: "center" }}>
                      {hasData ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <StarRating value={actualScore} />
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>No data</span>
                      )}
                    </td>
```

AND REPLACE:
```javascript
                    <td style={{ textAlign: "center" }}>
                      <span style={{
                        display: "inline-block", padding: "4px 12px",
                        borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: getBandColor(mockScore) + "20",
                        color: getBandColor(mockScore)
                      }}>
                        {mockBand}
                      </span>
                    </td>
```

WITH:
```javascript
                    <td style={{ textAlign: "center" }}>
                      {hasData ? (
                        <span style={{
                          display: "inline-block", padding: "4px 12px",
                          borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: getBandColor(actualScore) + "20",
                          color: getBandColor(actualScore)
                        }}>
                          {actualBand}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>
                      )}
                    </td>
```

AND REPLACE:
```javascript
                    <td style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
                      {mockLastReview}
                    </td>
```

WITH:
```javascript
                    <td style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
                      {lastReview}
                    </td>
```

## Testing Steps

1. **Restart Backend** - The new debug logging will help identify issues
2. **Open Browser Console** - Check for any JavaScript errors
3. **Login as Padmanabh (Manager)**
4. **Go to Performance page**
5. **Check Backend Logs** - Should see:
   ```
   === SEED DATA CALLED ===
   Caller Email: padmanabh@omoi.com
   Caller Role: MANAGER
   Manager role detected - finding team members...
   Found X team members in User collection
   ```
6. **Click "Seed Data" button**
7. **Check Backend Logs** - Should see:
   ```
   Processing employee: Mahesh with ID: XXX
   ✅ Created performance record with ID: XXX
   === SEEDING COMPLETE ===
   ```
8. **Check Frontend** - Should see alert with success message
9. **Refresh page** - Should see Mahesh's performance data with graphs
10. **Check Tracking Table** - Should show real data, not "No data"

## If Still Not Working

Check these in backend logs:
1. Is `managerEmail` set correctly in User collection for Mahesh?
2. Does Mahesh have an `employeeId` in User or Employee collection?
3. Are performance records being saved to MongoDB?

Check MongoDB directly:
```javascript
// In MongoDB Compass or shell
db.users.find({ email: "mahesh@gmail.com" })
// Should have: managerEmail: "padmanabh@omoi.com", employeeId: "EMPXXX"

db.performance.find({})
// Should show performance records after seeding
```
