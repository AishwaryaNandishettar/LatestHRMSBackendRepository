import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Create a notification for a specific event
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - Target user ID (who should receive the notification)
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type (info, success, warning, error)
 * @param {string} params.link - Optional link to navigate when clicked
 */
export const createNotification = async ({ userId, message, type = "info", link = null }) => {
  try {
    await axios.post(`${API_BASE_URL}/api/notifications`, {
      userId,
      message,
      type,
      link,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

/**
 * Notification generators for specific events
 */

// Employee check-in notification (for admin)
export const notifyCheckIn = async (employeeName, employeeId, adminUserId) => {
  await createNotification({
    userId: adminUserId,
    message: `${employeeName} (${employeeId}) has checked in`,
    type: "info",
    link: "/attendance",
  });
};

// Missed check-out notification (for admin and employee)
export const notifyMissedCheckOut = async (employeeName, employeeId, userIds) => {
  for (const userId of userIds) {
    await createNotification({
      userId,
      message: `${employeeName} (${employeeId}) missed check-out`,
      type: "warning",
      link: "/attendance",
    });
  }
};

// Payroll credited notification (for employee)
export const notifyPayrollCredit = async (employeeName, amount, userId) => {
  await createNotification({
    userId,
    message: `Payroll credited: ₹${amount.toLocaleString()} has been credited to your account`,
    type: "success",
    link: "/payroll",
  });
};

// Leave request notification (for admin/manager)
export const notifyLeaveRequest = async (employeeName, leaveType, adminUserId) => {
  await createNotification({
    userId: adminUserId,
    message: `${employeeName} requested ${leaveType} leave`,
    type: "info",
    link: "/leave",
  });
};

// Leave approved notification (for employee)
export const notifyLeaveApproved = async (leaveType, userId) => {
  await createNotification({
    userId,
    message: `Your ${leaveType} leave has been approved`,
    type: "success",
    link: "/leave",
  });
};

// Leave rejected notification (for employee)
export const notifyLeaveRejected = async (leaveType, reason, userId) => {
  await createNotification({
    userId,
    message: `Your ${leaveType} leave has been rejected${reason ? `: ${reason}` : ""}`,
    type: "error",
    link: "/leave",
  });
};

// Task assigned notification (for employee)
export const notifyTaskAssigned = async (taskTitle, userId) => {
  await createNotification({
    userId,
    message: `New task assigned: ${taskTitle}`,
    type: "info",
    link: "/tasks",
  });
};

// Task completed notification (for admin/manager)
export const notifyTaskCompleted = async (employeeName, taskTitle, adminUserId) => {
  await createNotification({
    userId: adminUserId,
    message: `${employeeName} completed task: ${taskTitle}`,
    type: "success",
    link: "/tasks",
  });
};

// Performance review notification (for employee)
export const notifyPerformanceReview = async (userId) => {
  await createNotification({
    userId,
    message: "Your performance review is ready",
    type: "info",
    link: "/performance",
  });
};

// Helpdesk ticket notification (for admin)
export const notifyHelpdeskTicket = async (employeeName, ticketSubject, adminUserId) => {
  await createNotification({
    userId: adminUserId,
    message: `New helpdesk ticket from ${employeeName}: ${ticketSubject}`,
    type: "info",
    link: "/helpdesk",
  });
};
