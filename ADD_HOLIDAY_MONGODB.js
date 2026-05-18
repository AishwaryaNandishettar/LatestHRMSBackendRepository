// MongoDB command to add Labour Day holiday
// Run this in MongoDB Compass or mongosh

db.events.insertOne({
  title: "Labour Day",
  date: "2026-05-01",
  type: "Holiday",
  description: "International Workers' Day - Public Holiday",
  createdBy: "admin"
});

// Verify it was added
db.events.find({ type: "Holiday" }).pretty();
