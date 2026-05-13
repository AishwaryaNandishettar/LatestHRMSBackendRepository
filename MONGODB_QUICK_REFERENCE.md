# MongoDB Atlas - Quick Reference Card

## 🚀 3 Ways to Share (Pick One)

### Option 1: Organization Access (BEST)
```
1. Organization Name ▼ → Organization Settings
2. Members → Invite Members
3. Email: team@company.com | Role: Manager
4. Click Invite
5. Team member accepts email
✅ Done in 2 minutes
```

### Option 2: Project Access
```
1. Project Settings → Members
2. Invite Members
3. Email: team@company.com | Role: Editor
4. Click Invite
5. Team member accepts email
✅ Done in 2 minutes
```

### Option 3: Connection String
```
1. Cluster0 → Connect → Drivers → Node.js
2. Copy connection string
3. Share with team member
4. They add to .env file
✅ Done in 1 minute
```

---

## 📋 Roles at a Glance

| Role | Organization | Project | Database |
|------|--------------|---------|----------|
| Owner | ✅ Full | ✅ Full | ✅ Full |
| Manager | ✅ Manage | ✅ Manage | ✅ Full |
| Editor | ❌ No | ✅ Edit | ✅ Full |
| Read Only | ❌ No | ✅ View | ✅ Read |

**For Developers:** Choose "Manager" or "Editor"

---

## 🔗 Connection String

**Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hrms?retryWrites=true&w=majority
```

**Get It:**
```
Cluster0 → Connect → Drivers → Node.js → Copy
```

**Use It:**
```
.env file:
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hrms?retryWrites=true&w=majority
```

---

## 🔐 Security Checklist

- [ ] Create individual database users
- [ ] Use strong passwords (auto-generate)
- [ ] Configure IP whitelist
- [ ] Enable 2FA on your account
- [ ] Document who has access
- [ ] Rotate passwords every 90 days

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't see cluster | Verify they accepted invitation, check role |
| Connection fails | Check username/password, verify IP whitelist |
| Access denied | Check user role, verify database user exists |
| Email not received | Check spam folder, resend invitation |

---

## 📞 Quick Links

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Documentation:** https://docs.atlas.mongodb.com
- **Support:** https://support.mongodb.com

---

## ✅ Verification

After sharing:
- [ ] Team member received email
- [ ] Team member accepted invitation
- [ ] Team member can log in
- [ ] Team member can see cluster
- [ ] Connection string works

---

## 🎯 Your Setup

```
Organization: Aishwarya's Org - 20...
Project: Project 0
Cluster: Cluster0
Database: hrms
```

---

## 📝 Team Member Email Template

```
Subject: MongoDB Atlas Access - HRMS Project

Hi [Name],

You've been invited to access our MongoDB Atlas database.

1. Check your email for MongoDB invitation
2. Click the link to accept
3. Log in to https://cloud.mongodb.com
4. Get connection string:
   Cluster0 → Connect → Drivers → Node.js
5. Add to your .env file:
   MONGODB_URI=<connection-string>
6. Test your connection

Questions? Let me know!

Thanks,
[Your Name]
```

---

## 🚀 Next Steps

1. Choose access method (Option 1, 2, or 3)
2. Send invitations
3. Verify access
4. Share connection string
5. Document access

---

**Time to Complete:** 5 minutes
**Difficulty:** Easy
**Status:** Ready to Share
