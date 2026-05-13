# MongoDB Atlas - Visual Step-by-Step Guide

## 🎯 Complete Visual Walkthrough

### STEP 1: Log In to MongoDB Atlas

**URL:** https://cloud.mongodb.com

**What you'll see:**
- MongoDB logo (top left)
- Login form with email and password
- "Sign Up" link (if you don't have account)

**Action:**
- Enter your email
- Enter your password
- Click "Sign In"

---

### STEP 2: You're Now in MongoDB Atlas Dashboard

**What you'll see:**
- Organization name (top left): "Aishwarya's Org - 20..."
- Project dropdown (next to org name): "Project 0"
- Left sidebar with options:
  - Data Explorer
  - Clusters
  - Database Access
  - Network Access
  - etc.

**Action:**
- Look at top left corner
- You should see your organization name

---

### STEP 3: Click Organization Name (Top Left)

**Current view:**
```
┌─────────────────────────────────────┐
│ Aishwarya's Org - 20... ▼           │  ← Click here
│ Project 0 ▼                         │
└─────────────────────────────────────┘
```

**What appears:**
- Dropdown menu with options:
  - Organization Settings
  - Billing
  - Support
  - Logout

**Action:**
- Click "Organization Settings"

---

### STEP 4: You're in Organization Settings

**What you'll see:**
- Left sidebar with options:
  - General
  - Members ← We need this
  - Teams
  - API Keys
  - etc.

**Action:**
- Click "Members" in left sidebar

---

### STEP 5: Members Page

**What you'll see:**
- List of current members
- "Invite Members" button (top right)
- Each member shows:
  - Name
  - Email
  - Role
  - Join date

**Action:**
- Click "Invite Members" button

---

### STEP 6: Invite Members Dialog

**What appears:**
```
┌─────────────────────────────────────┐
│ Invite Members                      │
├─────────────────────────────────────┤
│ Email Address:                      │
│ [____________________________]       │
│                                     │
│ Role:                               │
│ [Organization Manager ▼]            │
│                                     │
│ [Cancel]  [Invite]                  │
└─────────────────────────────────────┘
```

**Action:**
- Enter team member's email
- Select role from dropdown
- Click "Invite"

---

### STEP 7: Role Selection

**Available roles:**
```
Organization Owner
├─ Full access to everything
├─ Can manage billing
├─ Can add/remove members
└─ Use sparingly

Organization Manager
├─ Can manage projects
├─ Can add/remove members
├─ Cannot manage billing
└─ Good for team leads

Organization Editor
├─ Can edit resources
├─ Cannot manage members
├─ Cannot manage billing
└─ Good for developers

Organization Read Only
├─ View-only access
├─ Cannot make changes
└─ Good for stakeholders
```

**Recommendation for developers:**
- Choose "Organization Manager" or "Organization Editor"

---

### STEP 8: Invitation Sent

**What you'll see:**
- Success message: "Invitation sent to [email]"
- Team member appears in members list with status "Pending"

**What happens next:**
- Team member receives email invitation
- Email contains link to accept invitation
- Team member clicks link
- Team member creates account or logs in
- Team member accepts invitation
- Status changes from "Pending" to "Active"

---

### STEP 9: Team Member Receives Email

**Email content:**
```
Subject: You've been invited to join Aishwarya's Org - 20...

Hi [Team Member Name],

You've been invited to join the MongoDB Atlas organization 
"Aishwarya's Org - 20..." with the role of Organization Manager.

[Accept Invitation] ← Click this link

If you don't have a MongoDB account, you'll be asked to create one.

Best regards,
MongoDB Atlas
```

**Action (Team Member):**
- Click "Accept Invitation" link
- Create account or log in
- Accept invitation

---

### STEP 10: Team Member Now Has Access

**What team member will see:**
- Can log in to MongoDB Atlas
- Can see organization: "Aishwarya's Org - 20..."
- Can see project: "Project 0"
- Can see cluster: "Cluster0"
- Can access database: "hrms"

**Team member can now:**
- View data in collections
- Create/edit documents
- Run queries
- Export data
- (Based on their role)

---

## 🔗 Getting Connection String

### STEP 1: Go to Cluster

**From Dashboard:**
```
Left Sidebar → Clusters
```

**What you'll see:**
- List of clusters
- "Cluster0" should be visible
- Status: "Active" (green)

**Action:**
- Click "Cluster0"

---

### STEP 2: Click Connect

**What you'll see:**
- Cluster details page
- "Connect" button (top right)

**Action:**
- Click "Connect" button

---

### STEP 3: Connection Method Dialog

**What appears:**
```
┌─────────────────────────────────────┐
│ Connect to Cluster0                 │
├─────────────────────────────────────┤
│ Choose a connection method:         │
│                                     │
│ ○ Drivers                           │
│ ○ MongoDB Shell                     │
│ ○ MongoDB Compass                   │
│ ○ VS Code                           │
│                                     │
└─────────────────────────────────────┘
```

**Action:**
- Select "Drivers"

---

### STEP 4: Select Language

**What you'll see:**
```
Language: [Node.js ▼]
```

**Available options:**
- Node.js (for JavaScript/Node.js)
- Python
- Java
- C#
- Go
- Rust
- etc.

**Action:**
- Select "Node.js" (for your backend)

---

### STEP 5: Copy Connection String

**What you'll see:**
```
Connection String:

mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hrms?retryWrites=true&w=majority
```

**Action:**
- Click "Copy" button
- Or manually select and copy

---

### STEP 6: Share Connection String

**Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hrms?retryWrites=true&w=majority
```

**Share via:**
- Email (secure)
- Password manager (1Password, LastPass)
- Encrypted message
- Team documentation (restricted access)

**Team member adds to .env:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hrms?retryWrites=true&w=majority
```

---

## 🔐 Creating Database User

### STEP 1: Go to Database Access

**From Dashboard:**
```
Left Sidebar → Database Access
```

**What you'll see:**
- List of database users
- "Add New Database User" button

---

### STEP 2: Click Add New Database User

**What appears:**
```
┌─────────────────────────────────────┐
│ Add New Database User               │
├─────────────────────────────────────┤
│ Authentication Method:              │
│ ○ Password                          │
│ ○ Certificate                       │
│                                     │
│ Username: [________________]         │
│ Password: [________________]         │
│           [Auto Generate]           │
│                                     │
│ Database User Privileges:           │
│ ○ Read and write to any database    │
│ ○ Read only to any database         │
│ ○ Custom roles                      │
│                                     │
│ [Cancel]  [Add User]                │
└─────────────────────────────────────┘
```

---

### STEP 3: Enter Username

**Example:**
```
Username: team-member-1
```

---

### STEP 4: Set Password

**Options:**
- Enter password manually
- Click "Auto Generate" for secure password

**Recommendation:**
- Use "Auto Generate"
- Copy and save in password manager

---

### STEP 5: Select Privileges

**Options:**
```
○ Read and write to any database ← Choose this for developers
○ Read only to any database
○ Custom roles
```

---

### STEP 6: Click Add User

**What happens:**
- User is created
- Appears in database users list
- Can now use this username/password to connect

---

## 🌐 IP Whitelist

### STEP 1: Go to Network Access

**From Dashboard:**
```
Left Sidebar → Network Access
```

**What you'll see:**
- List of whitelisted IPs
- "Add IP Address" button

---

### STEP 2: Click Add IP Address

**What appears:**
```
┌─────────────────────────────────────┐
│ Add IP Address                      │
├─────────────────────────────────────┤
│ IP Address: [________________]       │
│                                     │
│ [Add Current IP Address]            │
│ [Add IP Address]                    │
│                                     │
│ Comment: [________________]          │
│                                     │
│ [Cancel]  [Confirm]                 │
└─────────────────────────────────────┘
```

---

### STEP 3: Enter IP Address

**Options:**
```
Option A: Add Current IP
- Click "Add Current IP Address"
- Your current IP is auto-filled

Option B: Add Specific IP
- Enter IP address manually
- Example: 192.168.1.100

Option C: Allow All IPs
- Enter: 0.0.0.0/0
- Less secure but works from anywhere
```

---

### STEP 4: Click Confirm

**What happens:**
- IP is added to whitelist
- Connections from this IP are allowed
- Other IPs are blocked

---

## ✅ Verification Checklist

After sharing access, verify:

```
□ Team member received invitation email
□ Team member accepted invitation
□ Team member can log in to MongoDB Atlas
□ Team member can see organization
□ Team member can see project
□ Team member can see cluster
□ Team member can see database
□ Connection string works
□ Database user created
□ IP whitelist configured
```

---

## 🎯 Quick Reference

### Add Organization Member
```
Organization Name ▼ → Organization Settings → Members → Invite Members
```

### Add Project Member
```
Project Settings → Members → Invite Members
```

### Get Connection String
```
Cluster0 → Connect → Drivers → Node.js → Copy
```

### Create Database User
```
Database Access → Add New Database User
```

### Whitelist IP
```
Network Access → Add IP Address
```

---

## 📊 Current Setup

**Your Organization:** Aishwarya's Org - 20...
**Your Project:** Project 0
**Your Cluster:** Cluster0
**Your Database:** hrms

---

**Last Updated:** May 7, 2026
**Status:** Ready to Share
