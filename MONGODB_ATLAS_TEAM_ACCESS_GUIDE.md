# MongoDB Atlas - Team Access Guide

## 🎯 Overview

This guide explains how to give your team members access to your MongoDB Atlas database so they can continue working on the HRMS project.

---

## 📋 Prerequisites

Before sharing access, ensure:
- ✅ You have a MongoDB Atlas account
- ✅ You have an active cluster (Cluster0)
- ✅ You have admin/owner permissions
- ✅ Your team members have email addresses

---

## 🔑 Method 1: Add Team Members to Organization (Recommended)

This is the best method for team collaboration.

### Step 1: Go to Organization Settings

1. Log in to MongoDB Atlas: https://cloud.mongodb.com
2. Click on your **Organization name** (top left)
3. Select **Organization Settings**

### Step 2: Add Team Members

1. In Organization Settings, click **Members** (left sidebar)
2. Click **Invite Members** button
3. Enter team member's email address
4. Select role:
   - **Organization Owner** - Full access (use sparingly)
   - **Organization Manager** - Can manage projects and users
   - **Organization Billing Admin** - Can manage billing only
   - **Organization Read Only** - View-only access
5. Click **Invite**

### Step 3: Team Member Accepts Invitation

1. Team member receives email invitation
2. Clicks link in email
3. Creates MongoDB Atlas account (if needed)
4. Accepts invitation
5. Now has access to organization and all projects

---

## 🔑 Method 2: Add Members to Specific Project

If you only want to share a specific project (not the whole organization):

### Step 1: Go to Project Settings

1. Log in to MongoDB Atlas
2. Select your **Project** (e.g., "Project 0")
3. Click **Project Settings** (bottom left)

### Step 2: Add Project Members

1. Click **Members** (left sidebar)
2. Click **Invite Members** button
3. Enter team member's email
4. Select role:
   - **Project Owner** - Full access to project
   - **Project Manager** - Can manage project
   - **Project Editor** - Can edit resources
   - **Project Read Only** - View-only access
5. Click **Invite**

### Step 3: Team Member Accepts

1. Team member receives email
2. Accepts invitation
3. Now has access to this specific project

---

## 🔑 Method 3: Share Database Connection String

For developers who only need to connect to the database:

### Step 1: Get Connection String

1. Log in to MongoDB Atlas
2. Go to your **Cluster** (Cluster0)
3. Click **Connect** button
4. Select **Drivers** tab
5. Choose **Node.js** (or your language)
6. Copy the connection string

### Step 2: Share with Team

**Connection String Format:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
```

**Share via:**
- Email (secure channel)
- Password manager (1Password, LastPass, etc.)
- Encrypted message
- Team documentation (with restricted access)

### Step 3: Team Member Uses Connection String

1. Add to `.env` file:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hrms?retryWrites=true&w=majority
   ```

2. Backend automatically connects using this URI

---

## 🔐 Security Best Practices

### 1. Create Database User for Each Team Member

**Instead of sharing one password, create individual users:**

1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Enter username (e.g., `team-member-1`)
4. Set password (or auto-generate)
5. Select role: **Read and write to any database**
6. Click **Add User**

**Benefits:**
- Track who accessed what
- Revoke access individually
- Audit trail for security

### 2. Use IP Whitelist

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Add team member's IP address
4. Or add `0.0.0.0/0` for anywhere (less secure)

### 3. Enable Two-Factor Authentication

1. Go to **Account Settings**
2. Enable **Two-Factor Authentication**
3. Share backup codes securely with team

### 4. Rotate Passwords Regularly

- Change database passwords every 90 days
- Update team members with new credentials
- Use password manager for secure sharing

---

## 📊 Role Comparison

| Role | Organization | Project | Database | Billing |
|------|--------------|---------|----------|---------|
| Owner | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Manager | ✅ Manage | ✅ Manage | ✅ Full | ❌ No |
| Editor | ❌ No | ✅ Edit | ✅ Full | ❌ No |
| Read Only | ❌ No | ✅ View | ✅ Read | ❌ No |

---

## 🚀 Step-by-Step: Add Team Member

### For Organization Access (Full Collaboration)

1. **Log in to MongoDB Atlas**
   - Go to https://cloud.mongodb.com
   - Enter your credentials

2. **Click Organization Name** (top left)
   - Select "Aishwarya's Org - 20..."

3. **Click Organization Settings**
   - Left sidebar → Settings

4. **Click Members**
   - Left sidebar → Members

5. **Click Invite Members**
   - Button at top right

6. **Enter Team Member Email**
   - Example: `team-member@company.com`

7. **Select Role**
   - Choose appropriate role (see Role Comparison above)

8. **Click Invite**
   - Invitation sent to email

9. **Team Member Accepts**
   - Checks email
   - Clicks invitation link
   - Creates account or logs in
   - Accepts invitation

10. **Team Member Now Has Access**
    - Can see all projects
    - Can access all clusters
    - Can view/edit data (based on role)

---

## 🔗 Connection String for Backend

Once team member has access, they need the connection string:

### Get Connection String

1. Go to **Cluster0**
2. Click **Connect**
3. Select **Drivers**
4. Choose **Node.js**
5. Copy connection string

### Format

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hrms?retryWrites=true&w=majority
```

### Add to Backend

**File:** `HRMS-Backend/src/main/resources/application.properties`

```properties
spring.data.mongodb.uri=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hrms?retryWrites=true&w=majority
```

---

## 📝 Sharing Checklist

Before sharing access, prepare:

- [ ] Team member email addresses
- [ ] Decide on access level (Organization vs Project)
- [ ] Create individual database users (if needed)
- [ ] Document connection string
- [ ] Prepare security guidelines
- [ ] Set up IP whitelist (if needed)
- [ ] Enable 2FA on your account
- [ ] Create backup codes

---

## 🔄 Revoking Access

If you need to remove team member access:

### Remove from Organization

1. Go to **Organization Settings**
2. Click **Members**
3. Find team member
4. Click **Remove** button
5. Confirm removal

### Remove from Project

1. Go to **Project Settings**
2. Click **Members**
3. Find team member
4. Click **Remove** button
5. Confirm removal

### Disable Database User

1. Go to **Database Access**
2. Find user
3. Click **Delete** button
4. Confirm deletion

---

## 🆘 Troubleshooting

### Team Member Can't See Cluster

**Solution:**
1. Verify they accepted the invitation
2. Check their role has database access
3. Verify IP whitelist includes their IP
4. Ask them to log out and log back in

### Connection String Not Working

**Solution:**
1. Verify username and password are correct
2. Check database name is correct
3. Verify IP whitelist includes their IP
4. Check special characters are URL-encoded

### Access Denied Error

**Solution:**
1. Verify user role has read/write permissions
2. Check IP whitelist
3. Verify database user exists
4. Check password is correct

### Can't Find Organization Settings

**Solution:**
1. Click on organization name (top left)
2. Select "Organization Settings"
3. If not visible, you may not have owner permissions
4. Contact organization owner

---

## 📞 Support Resources

- **MongoDB Atlas Documentation:** https://docs.atlas.mongodb.com
- **MongoDB Support:** https://support.mongodb.com
- **Community Forum:** https://www.mongodb.com/community/forums

---

## 🎯 Quick Reference

### Add Organization Member
```
Organization Settings → Members → Invite Members → Enter Email → Select Role → Invite
```

### Add Project Member
```
Project Settings → Members → Invite Members → Enter Email → Select Role → Invite
```

### Get Connection String
```
Cluster → Connect → Drivers → Node.js → Copy String
```

### Create Database User
```
Database Access → Add New Database User → Enter Username → Set Password → Add User
```

### Whitelist IP
```
Network Access → Add IP Address → Enter IP → Confirm
```

---

## 📊 Current Setup

**Your Organization:** Aishwarya's Org - 20...
**Your Project:** Project 0
**Your Cluster:** Cluster0
**Database:** hrms

---

## ✅ Next Steps

1. **Identify team members** who need access
2. **Decide access level** (Organization or Project)
3. **Create database users** for each team member
4. **Send invitations** via MongoDB Atlas
5. **Share connection string** securely
6. **Document access** for your records
7. **Set up security** (2FA, IP whitelist)

---

**Last Updated:** May 7, 2026
**Status:** Ready to Share Access
