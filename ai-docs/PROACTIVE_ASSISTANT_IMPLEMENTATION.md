# Proactive Assistant - Full Implementation Plan

**Feature**: Advanced AI Feature (10 points)  
**Name**: Proactive Assistant (renamed from Scheduling Agent)  
**Goal**: Auto-detect and help with ALL scheduling needs in conversations

---

## 🎯 **Core Capabilities**

### **1. Multi-Thread Detection**
- Scan entire conversation
- Detect ALL scheduling hints (not just one)
- Examples:
  - "schedule a meeting"
  - "let's have a call"
  - "when can we catch up"
  - "meeting tomorrow"

### **2. Smart Date/Time Extraction**
For each hint:
- **Specific date**: "Dec 2", "tomorrow", "next Monday"
- **Vague date**: "next week", "soon", "sometime"
- **Specific time**: "2 PM", "14:00", "afternoon"
- **Vague time**: "morning", "evening", "not specified"

### **3. Context Awareness**
- Who's involved? (participants mentioned)
- What's it about? (topic from surrounding messages)
- Is it already scheduled? (date + time both specific)

---

## 📊 **Backend Response Structure**

```javascript
{
  "success": true,
  "data": {
    "threads": [
      {
        "id": "thread_1",
        "topic": "Job discussion meeting",
        "triggerMessage": "Schedule meeting in dec for job joining",
        "messageContext": ["Previous message", "Trigger", "Next message"],
        "confidence": 0.95,
        "dateInfo": {
          "specified": true,
          "value": "2025-12-02",
          "original": "dec",
          "vague": false
        },
        "timeInfo": {
          "specified": false,
          "value": null,
          "original": null,
          "vague": true,
          "vagueDescription": "not mentioned"
        },
        "participants": [
          {"userId": "user1", "name": "John"},
          {"userId": "user2", "name": "Sarah"}
        ],
        "status": "needs_time", // "needs_date", "needs_time", "needs_both", "ready"
        "suggestedTimes": [
          {
            "time": "09:00",
            "endTime": "09:30",
            "date": "2025-12-02",
            "quality": "best",
            "reason": "Best for global team"
          },
          {
            "time": "14:00",
            "endTime": "14:30", 
            "date": "2025-12-02",
            "quality": "good",
            "reason": "Good availability"
          },
          {
            "time": "16:00",
            "endTime": "16:30",
            "date": "2025-12-02",
            "quality": "acceptable",
            "reason": "Alternative option"
          }
        ]
      },
      {
        "id": "thread_2",
        "topic": "Team catch up",
        ...
      }
    ],
    "totalThreads": 2,
    "needsAction": 2 // How many need user input
  }
}
```

---

## 🎨 **Frontend UI Structure**

### **Component 1: ProactiveAssistantModal**
Main container that switches between list and detail views

### **Component 2: ThreadListView**  
Shows all detected scheduling threads

```typescript
<FlatList
  data={threads}
  renderItem={({ item }) => (
    <ThreadCard
      thread={item}
      onPress={() => selectThread(item)}
    />
  )}
/>
```

### **Component 3: ThreadCard**
```typescript
<TouchableOpacity style={styles.threadCard}>
  <Text style={styles.topic}>{thread.topic}</Text>
  <View style={styles.dateTimeRow}>
    <Text>📅 {thread.dateInfo.specified ? thread.dateInfo.original : 'Date not specified'}</Text>
    <Text>⏰ {thread.timeInfo.specified ? thread.timeInfo.original : 'Time not specified'}</Text>
  </View>
  <Text style={styles.participants}>With: {thread.participants.map(p => p.name).join(', ')}</Text>
  <Badge status={thread.status} />
</TouchableOpacity>
```

### **Component 4: ThreadDetailView**
Shows time suggestions for selected thread

```typescript
<View>
  <MeetingDetailsCard thread={selectedThread} />
  <TimeSuggestionsList 
    suggestions={selectedThread.suggestedTimes}
    onSelect={handleSelectTime}
  />
  <ConfirmButton 
    onPress={handleConfirm}
    disabled={!selectedTime}
  />
</View>
```

---

## 🔧 **Implementation Checklist**

### **Backend (schedulingAgent.js)**
- [ ] Detect multiple scheduling keywords
- [ ] Extract date info (specific or vague)
- [ ] Extract time info (specific or vague)
- [ ] Group by topic/context
- [ ] Generate 3 time suggestions per thread
- [ ] Return array of threads

### **Frontend**
- [ ] Rename SchedulingModal → ProactiveAssistantModal
- [ ] Create ThreadListView
- [ ] Create ThreadCard component
- [ ] Create ThreadDetailView
- [ ] Remove Google Calendar integration
- [ ] Add simple confirm workflow
- [ ] Fix all white text issues
- [ ] Add status badges (needs_date, needs_time, ready)

---

## ⏱️ **Estimated Time**

- Backend changes: 1.5 hours
- Frontend redesign: 1.5 hours
- Testing & fixes: 1 hour
- **Total: 3-4 hours**

---

## ✅ **Ready to Start?**

I'll implement this step-by-step:
1. Update backend to detect multiple threads
2. Create new UI components
3. Wire everything together
4. Test and polish

**Shall I proceed?** 🚀

