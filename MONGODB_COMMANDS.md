# MongoDB Commands for Timesheet Setup

## Quick Copy-Paste Commands

### Step 1: Set Mahesh's Manager

```javascript
db.users.updateOne(
  { email: "mahesh@gmail.com" },
  { $set: { managerEmail: "Padmanabhmanager@omoi.com" } }
)
```

**Expected Output:**
```
{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }
```

---

### Step 2: Set Mahesh's Employees' Manager

```javascript
db.users.updateMany(
  { managerEmail: "mahesh@gmail.com" },
  { $set: { managerEmail: "mahesh@gmail.com" } }
)
```

**Expected Output:**
```
{ acknowledged: true, matchedCount: 3, modifiedCount: 3 }
```

---

### Step 3: Verify Padmanabhmanager's Team

```javascript
db.users.find({ managerEmail: "Padmanabhmanager@omoi.com" })
```

**Expected Output:**
```
[
  {
    _id: ObjectId("..."),
    email: "mahesh@gmail.com",
    name: "Mahesh",
    managerEmail: "Padmanabhmanager@omoi.com",
    ...
  }
]
```

---

### Step 4: Verify Mahesh's Team

```javascript
db.users.find({ managerEmail: "mahesh@gmail.com" })
```

**Expected Output:**
```
[
  {
    _id: ObjectId("..."),
    email: "employee1@gmail.com",
    name: "Employee1",
    managerEmail: "mahesh@gmail.com",
    ...
  },
  {
    _id: ObjectId("..."),
    email: "employee2@gmail.com",
    name: "Employee2",
    managerEmail: "mahesh@gmail.com",
    ...
  },
  {
    _id: ObjectId("..."),
    email: "employee3@gmail.com",
    name: "Employee3",
    managerEmail: "mahesh@gmail.com",
    ...
  }
]
```

---

## How to Execute in MongoDB Atlas

### Method 1: Using MongoDB Atlas UI

1. Go to https://cloud.mongodb.com
2. Click on your cluster
3. Click "Collections"
4. Click on "users" collection
5. Click "MONGOSH" tab
6. Copy and paste the commands above
7. Press Enter to execute

### Method 2: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your cluster
3. Select database and "users" collection
4. Click "Aggregations" tab
5. Or use the query bar to run commands

### Method 3: Using Command Line

```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/database"
```

Then paste the commands.

---

## Verification Commands

### Check if managerEmail is set correctly

```javascript
// Check Mahesh
db.users.findOne({ email: "mahesh@gmail.com" })

// Check Employee1
db.users.findOne({ email: "employee1@gmail.com" })

// Check Padmanabhmanager
db.users.findOne({ email: "Padmanabhmanager@omoi.com" })
```

### Count users by manager

```javascript
// Count Padmanabhmanager's direct reports
db.users.countDocuments({ managerEmail: "Padmanabhmanager@omoi.com" })

// Count Mahesh's direct reports
db.users.countDocuments({ managerEmail: "mahesh@gmail.com" })
```

### Find users without a manager

```javascript
db.users.find({ managerEmail: { $exists: false } })
```

---

## Troubleshooting Commands

### Issue: Command didn't work

**Check 1: Verify collection exists**
```javascript
db.getCollectionNames()
// Should include "users"
```

**Check 2: Verify user exists**
```javascript
db.users.findOne({ email: "mahesh@gmail.com" })
// Should return a document
```

**Check 3: Check all fields in user document**
```javascript
db.users.findOne({ email: "mahesh@gmail.com" }, { projection: { _id: 1, email: 1, managerEmail: 1, name: 1 } })
```

---

## Bulk Update Commands

### Update all IT department employees to report to Mahesh

```javascript
db.users.updateMany(
  { department: "IT", role: "employee" },
  { $set: { managerEmail: "mahesh@gmail.com" } }
)
```

### Update all managers to report to Padmanabhmanager

```javascript
db.users.updateMany(
  { role: "manager", email: { $ne: "Padmanabhmanager@omoi.com" } },
  { $set: { managerEmail: "Padmanabhmanager@omoi.com" } }
)
```

### Remove managerEmail from all users (if needed to reset)

```javascript
db.users.updateMany(
  {},
  { $unset: { managerEmail: "" } }
)
```

---

## Export/Backup Commands

### Export users collection to JSON

```bash
mongoexport --uri "mongodb+srv://username:password@cluster.mongodb.net/database" \
  --collection users \
  --out users_backup.json
```

### Import users collection from JSON

```bash
mongoimport --uri "mongodb+srv://username:password@cluster.mongodb.net/database" \
  --collection users \
  --file users_backup.json
```

---

## Advanced Queries

### Find all users with their manager's name

```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "managerEmail",
      foreignField: "email",
      as: "manager"
    }
  },
  {
    $project: {
      email: 1,
      name: 1,
      managerEmail: 1,
      managerName: { $arrayElemAt: ["$manager.name", 0] }
    }
  }
])
```

### Find the complete hierarchy

```javascript
db.users.find({}, { email: 1, name: 1, managerEmail: 1, role: 1 }).sort({ managerEmail: 1 })
```

---

## Common Errors & Solutions

### Error: "E11000 duplicate key error"
- This shouldn't happen with updateOne/updateMany
- If it does, check for duplicate emails

### Error: "No documents matched the query"
- Verify the email exists: `db.users.findOne({ email: "mahesh@gmail.com" })`
- Check spelling and case sensitivity

### Error: "Cannot read property 'email' of null"
- User doesn't exist
- Verify email is correct

---

## Step-by-Step Execution

1. **Copy Step 1 command** → Paste in MongoDB → Execute
2. **Copy Step 2 command** → Paste in MongoDB → Execute
3. **Copy Step 3 command** → Paste in MongoDB → Verify output
4. **Copy Step 4 command** → Paste in MongoDB → Verify output
5. **Done!** ✅

---

## Done! ✅

All MongoDB commands are ready to execute. Just copy and paste in MongoDB Atlas.
