# Proactive Assistant Redesign Plan

## 🎯 **New Vision**

**Name**: Proactive Assistant (not "Scheduling Agent")

**Purpose**: Automatically detect and help with ALL scheduling needs in a conversation

---

## 🧠 **How It Should Work**

### **Step 1: Scan Entire Chat**
- Go through all messages
- Detect scheduling hints:
  - "let's schedule a meeting"
  - "have a meeting"
  - "let's catch up"
  - "when can we meet"
  - "schedule a call"

### **Step 2: Extract Details for Each Hint**
For each detected scheduling need:
- ✅ Context (messages around it)
- ✅ Date mentioned? (e.g., "tomorrow", "Dec 2", "next week")
- ✅ Time mentioned? (e.g., "2 PM", "afternoon", "morning")
- ✅ Who's involved? (participants in that sub-thread)
- ✅ Topic? (what's the meeting about)

### **Step 3: Group into Sub-Threads**
- Thread 1: "Schedule meeting for job discussion" (Dec 2, vague time)
- Thread 2: "Let's catch up next week" (vague date, vague time)
- Thread 3: "Meeting at 2 PM tomorrow" (specific date, specific time)

---

## 🎨 **New UI Flow**

### **Main Screen: List of Detected Threads**
```
┌─────────────────────────────────┐
│  ✨ Proactive Assistant     ✕   │
├─────────────────────────────────┤
│  Found 3 scheduling needs:      │
├─────────────────────────────────┤
│  📅 Job Discussion Meeting      │
│  └ Dec 2, time not specified    │
│  └ With: John, Sarah            │
│  └ Tap to suggest times →       │
├─────────────────────────────────┤
│  📅 Team Catch Up               │
│  └ Next week, time not specified│
│  └ With: Mike, Lisa             │
│  └ Tap to suggest times →       │
├─────────────────────────────────┤
│  📅 Quick Sync                  │
│  └ Tomorrow at 2 PM             │
│  └ With: Alex                   │
│  └ Already scheduled ✓          │
└─────────────────────────────────┘
```

### **Detail Screen: Time Suggestions**
```
┌─────────────────────────────────┐
│  ← Job Discussion Meeting       │
├─────────────────────────────────┤
│  📋 Details:                    │
│  Topic: Job discussion          │
│  Date: Dec 2 (specified)        │
│  Time: Not specified            │
│  Participants: John, Sarah, You │
├─────────────────────────────────┤
│  ⏰ Suggested Times:            │
├─────────────────────────────────┤
│  ○ 9:00 AM - 9:30 AM           │
│  Best for team across timezones │
├─────────────────────────────────┤
│  ○ 2:00 PM - 2:30 PM           │
│  Good availability              │
├─────────────────────────────────┤
│  ○ 4:00 PM - 4:30 PM           │
│  Acceptable                     │
├─────────────────────────────────┤
│  [Confirm Selected Time]        │
└─────────────────────────────────┘
```

---

## 🔧 **Backend Changes Needed**

### **New API Response Format**:
```json
{
  "schedulingThreads": [
    {
      "id": "thread_1",
      "topic": "Job discussion meeting",
      "triggerMessage": "Schedule meeting in Dec for job joining",
      "confidence": 0.95,
      "dateInfo": {
        "specified": true,
        "value": "2025-12-02",
        "original": "Dec 2"
      },
      "timeInfo": {
        "specified": false,
        "vague": "not mentioned"
      },
      "participants": ["user1", "user2"],
      "status": "needs_scheduling"
    },
    {
      "id": "thread_2",
      ...
    }
  ],
  "suggestedTimes": {
    "thread_1": [
      { "time": "9:00 AM", "quality": "best" },
      { "time": "2:00 PM", "quality": "good" },
      { "time": "4:00 PM", "quality": "acceptable" }
    ]
  }
}
```

---

## ✅ **Implementation Steps**

### **Phase 1: Backend**
1. Update `schedulingAgent.js` to detect MULTIPLE scheduling hints
2. For each hint, extract date/time (or mark as vague)
3. Group by topic/context
4. Return array of threads with suggested times

### **Phase 2: Frontend**
1. Rename SchedulingModal → ProactiveAssistantModal
2. Show list of all detected threads
3. Tap thread → Show time suggestions
4. Select time → Confirm (no Google Calendar)
5. Mark as scheduled

---

## 🤔 **Your Approval**

**Does this match your vision?**
- Multiple scheduling hints detected ✅
- Each hint analyzed separately ✅
- Vague timelines handled ✅
- No Google Calendar ✅
- Simple confirm workflow ✅

**Should I proceed with this redesign?** 🎯

