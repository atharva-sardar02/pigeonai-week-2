# Persona Selection Guide for Pigeon AI

**Purpose**: Choose the right persona to maximize rubric score and create focused, valuable AI features.

**Decision Required**: Select 1 persona from 4 options before starting PR #13 (AI feature implementation).

---

## Persona Options Overview

| Persona | Core Challenge | Best For | Complexity |
|---------|---------------|----------|------------|
| **Remote Team Professional** | Timezone coordination, async decisions | Distributed teams, project management | Medium |
| **International Communicator** | Language barriers, cultural context | Multilingual teams, global communication | High |
| **Busy Parent** | Schedule coordination, quick updates | Family logistics, time management | Low-Medium |
| **Content Creator** | Collaboration, feedback, deadlines | Creative teams, content workflows | Medium-High |

---

## Persona 1: Remote Team Professional

### Profile
- **Who**: Software engineer, product manager, or team lead on a distributed team
- **Location**: Works across 3+ timezones (e.g., US, Europe, Asia)
- **Team Size**: 5-15 people, rarely in the same timezone
- **Pain Points**:
  - 🕐 Async communication leads to lost context
  - 📋 Action items buried in long threads
  - 🔍 Hard to find past decisions in chat history
  - ⚠️ Urgent messages lost among casual chat
  - 📅 Scheduling meetings across timezones is painful

### AI Features Tailored for Remote Team Professional

#### 1. **Thread Summarization**
**Problem**: Team members join late or miss async discussions.  
**Solution**: Summarize last 100 messages focusing on:
- Technical decisions made
- Blockers identified
- Next steps agreed upon
- Key discussion points
**Example**: "Meeting at 2pm EST → Summarize: Decided to use AWS Lambda for backend, John will review PR by EOD, blocker: API rate limits."

#### 2. **Action Item Extraction**
**Problem**: Tasks mentioned in chat are forgotten or unclear who's responsible.  
**Solution**: Extract and track:
- "Can you deploy by Friday?" → Action: Deploy (Assigned: You, Deadline: Friday)
- "@Sarah please review the PR" → Action: Review PR (Assigned: Sarah)
**UI**: Dashboard of pending action items per person.

#### 3. **Smart Semantic Search**
**Problem**: Finding technical discussions from weeks ago is tedious.  
**Solution**: Natural language search:
- "deployment discussion last week" → Finds relevant messages
- "database migration decision" → Surfaces the thread where it was decided
**Accuracy**: >90% for technical queries.

#### 4. **Priority Message Detection**
**Problem**: Urgent production issues buried in casual chat.  
**Solution**: Auto-detect urgency:
- "URGENT: Production is down!" → High Priority (red badge, push notification)
- "Can you review when you have time?" → Low Priority (no badge)
**Filter**: "Show only high priority messages."

#### 5. **Decision Tracking**
**Problem**: Unclear what was actually decided in long discussions.  
**Solution**: Extract and timeline agreed decisions:
- "Let's go with Option B for deployment" → Decision recorded
- Links back to source messages for context
**UI**: Decision timeline per conversation.

#### 6. **Advanced: Proactive Scheduling Assistant** (Multi-Step Agent)
**Problem**: Scheduling across timezones is time-consuming.  
**Solution**: Multi-step agent:
1. Detects: "Let's have a sync about the project"
2. Extracts: Participants, topic, timezone preferences
3. Suggests: 3 optimal times that work for all timezones
4. Generates: Calendar invite with Google Calendar link
**Accuracy**: >85% for clear scheduling requests.

### Strengths of This Persona
✅ Clear, well-defined pain points  
✅ Easy to test accuracy (technical decisions are objective)  
✅ High rubric appeal (solves real professional problems)  
✅ All 5 AI features directly address pain points  
✅ Advanced agent (scheduling) is highly valuable  

### Weaknesses
⚠️ Requires understanding of technical workflows  
⚠️ May need timezone handling for scheduling agent  

**Recommended**: ⭐⭐⭐⭐⭐ (Best balance of impact and feasibility)

---

## Persona 2: International Communicator

### Profile
- **Who**: Expat, international student, multilingual professional
- **Location**: Communicates with family/friends across countries
- **Languages**: Speaks 2+ languages, but not everyone speaks the same
- **Pain Points**:
  - 🌍 Language barriers in group chats
  - 🎭 Cultural context misunderstood
  - 📝 Slang/idioms cause confusion
  - ⏰ Timezone coordination
  - 📸 Sharing moments across borders

### AI Features Tailored for International Communicator

#### 1. **Thread Summarization**
**Problem**: Long multilingual conversations are hard to follow.  
**Solution**: Summarize in user's preferred language:
- Detects multiple languages in conversation
- Summarizes key points in English (or chosen language)
**Example**: Thread in Spanish + English → Summary in English.

#### 2. **Action Item Extraction**
**Problem**: Tasks mentioned in foreign language are missed.  
**Solution**: Extract action items across languages:
- "Puedes enviar las fotos mañana?" → Action: Send photos (Deadline: Tomorrow)
**Challenge**: Requires multilingual LLM support.

#### 3. **Smart Semantic Search**
**Problem**: Finding messages in mixed-language history is hard.  
**Solution**: Cross-language search:
- Search "birthday plans" → Finds messages in English, Spanish, French
**Implementation**: Embeddings work across languages.

#### 4. **Priority Message Detection**
**Problem**: Urgent family matters lost in casual chat.  
**Solution**: Detect urgency across languages:
- "Emergency! Call me now!" → High Priority (any language)
**Challenge**: Cultural differences in urgency expression.

#### 5. **Cultural Context Assistant**
**Problem**: Misunderstandings due to cultural differences.  
**Solution**: Detect potential misunderstandings:
- "That's interesting" (US sarcasm) → Flag: May be misinterpreted
**Advanced**: Suggest clearer phrasing.

#### 6. **Advanced: Real-Time Translation Agent** (Multi-Step Agent)
**Problem**: Group chats with multiple languages are chaotic.  
**Solution**: Multi-step agent:
1. Detects: Message in Spanish
2. Translates: To English for English speakers
3. Preserves: Original message for Spanish speakers
4. Contextualizes: Cultural notes if needed
**UI**: Inline translations, toggle to see original.

### Strengths of This Persona
✅ Unique, impactful use case  
✅ Showcases advanced NLP capabilities  
✅ High rubric appeal (solves real global problem)  

### Weaknesses
⚠️ High complexity (multilingual support is hard)  
⚠️ Harder to test accuracy (subjective translations)  
⚠️ OpenAI embeddings support many languages, but translation quality varies  
⚠️ Cultural context detection is ambitious  

**Recommended**: ⭐⭐⭐ (High impact, but high risk/complexity)

---

## Persona 3: Busy Parent

### Profile
- **Who**: Parent of 2+ kids, juggling work and family
- **Location**: Home, work, kid activities
- **Communication**: Spouse, kids, school, babysitters
- **Pain Points**:
  - 📅 Schedule chaos (soccer, dentist, school events)
  - ⏰ Forgetting commitments made in chat
  - 🚨 Urgent messages (kid sick, pickup time change) lost
  - 📋 To-dos scattered across conversations
  - 🤝 Coordinating with spouse asynchronously

### AI Features Tailored for Busy Parent

#### 1. **Thread Summarization**
**Problem**: Missed family planning discussion while at work.  
**Solution**: Summarize family chat:
- "Soccer practice moved to 4pm, pizza for dinner, dentist on Thursday"
**Example**: "Summarize family chat" → Quick recap.

#### 2. **Action Item Extraction**
**Problem**: Commitments made in chat are forgotten.  
**Solution**: Extract family to-dos:
- "Can you pick up milk on the way home?" → Action: Buy milk (Assigned: You)
- "Don't forget dentist at 3pm tomorrow" → Action: Dentist (Deadline: Tomorrow 3pm)
**UI**: Family to-do list with reminders.

#### 3. **Smart Semantic Search**
**Problem**: Finding when kid's school event was mentioned.  
**Solution**: Natural language search:
- "When is the science fair?" → Finds message: "Science fair is next Tuesday 6pm"
**Accuracy**: >90% for family logistics queries.

#### 4. **Priority Message Detection**
**Problem**: Urgent messages (kid sick) lost in chat.  
**Solution**: Auto-detect urgency:
- "Pick up Timmy NOW, school called" → High Priority (push notification)
- "Need to discuss weekend plans" → Low Priority
**Feature**: Auto-forward high priority to SMS (optional).

#### 5. **Decision Tracking**
**Problem**: Unclear what was agreed about weekend plans.  
**Solution**: Track family decisions:
- "Let's visit grandma on Saturday" → Decision recorded
**UI**: Family decision log.

#### 6. **Advanced: Family Scheduling Assistant** (Multi-Step Agent)
**Problem**: Coordinating family schedule is time-consuming.  
**Solution**: Multi-step agent:
1. Detects: "We need to schedule dentist for the kids"
2. Extracts: All kids, dentist preference
3. Suggests: 3 available times (based on school hours, work hours)
4. Generates: Calendar event with reminders
**Proactive**: "Next week is busy, suggest moving soccer?"

### Strengths of This Persona
✅ Relatable, clear pain points  
✅ Easy to demonstrate in demo video  
✅ Decision tracking and action items are very valuable  
✅ Scheduling assistant is practical  

### Weaknesses
⚠️ May seem less "professional" for rubric graders  
⚠️ Family use case may not showcase technical depth  
⚠️ Limited technical complexity compared to other personas  

**Recommended**: ⭐⭐⭐⭐ (Solid choice, but may lack technical depth)

---

## Persona 4: Content Creator

### Profile
- **Who**: YouTuber, blogger, designer, video editor
- **Team**: Collaborates with 3-5 other creators, freelancers
- **Communication**: Project updates, feedback, deadlines, ideas
- **Pain Points**:
  - 📹 Feedback buried in long threads
  - ⏰ Deadline confusion (multiple projects)
  - 🎨 Creative decisions unclear
  - 🔁 Version confusion (which draft is final?)
  - 📊 Tracking project status is manual

### AI Features Tailored for Content Creator

#### 1. **Thread Summarization**
**Problem**: Feedback on video draft scattered across 50 messages.  
**Solution**: Summarize feedback thread:
- "Main feedback: Shorten intro, add B-roll at 2:30, change thumbnail color"
**Example**: "Summarize feedback on Draft 3" → Quick recap.

#### 2. **Action Item Extraction**
**Problem**: Creative tasks mentioned casually are forgotten.  
**Solution**: Extract creative to-dos:
- "Can you add background music?" → Action: Add music (Assigned: You)
- "Need thumbnail by Friday" → Action: Design thumbnail (Deadline: Friday)
**UI**: Project-based to-do list.

#### 3. **Smart Semantic Search**
**Problem**: Finding where client feedback on specific scene was mentioned.  
**Solution**: Natural language search:
- "Client feedback on intro scene" → Finds: "Client wants faster pacing in intro"
**Accuracy**: >90% for creative discussions.

#### 4. **Priority Message Detection**
**Problem**: Urgent client revisions lost in casual brainstorming.  
**Solution**: Auto-detect urgency:
- "Client needs changes ASAP for launch tomorrow" → High Priority
- "Thinking about adding B-roll" → Low Priority
**Feature**: Separate urgent from brainstorming.

#### 5. **Decision Tracking**
**Problem**: Unclear which creative direction was finalized.  
**Solution**: Track creative decisions:
- "Let's go with Option B for the thumbnail" → Decision recorded
- "Decided on blue color scheme" → Decision logged
**UI**: Decision history per project.

#### 6. **Advanced: Creative Project Manager Agent** (Multi-Step Agent)
**Problem**: Tracking project status across multiple conversations is manual.  
**Solution**: Multi-step agent:
1. Monitors: All project-related messages
2. Extracts: Status updates, blockers, deadlines
3. Generates: Project status report ("Draft 3 pending review, deadline in 2 days")
4. Proactively suggests: "Deadline approaching, need final approval?"
**UI**: Auto-generated project dashboard.

### Strengths of This Persona
✅ Creative use case is unique  
✅ Decision tracking is highly valuable  
✅ Feedback summarization is practical  
✅ Project manager agent is impressive  

### Weaknesses
⚠️ Creative feedback is subjective (harder to measure 90% accuracy)  
⚠️ May require domain-specific prompts (video editing terms)  
⚠️ Less "serious" than professional personas for rubric  

**Recommended**: ⭐⭐⭐⭐ (Great choice, creative angle stands out)

---

## Comparison Matrix

| Criteria | Remote Team Pro | International | Busy Parent | Content Creator |
|----------|----------------|---------------|-------------|----------------|
| **Pain Points** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Feasibility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Rubric Appeal** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Technical Depth** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Test Accuracy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Advanced Agent** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Demo Impact** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **TOTAL** | **34/35** | **29/35** | **27/35** | **28/35** |

---

## Recommendation

### 🏆 **Best Choice: Remote Team Professional**

**Why:**
1. **Clear, measurable pain points** - Easy to demonstrate 90%+ accuracy
2. **All 5 AI features directly solve real problems** - High rubric relevance score
3. **Technical depth** - Showcases NLP, RAG, multi-step agent
4. **Scheduling agent is highly practical** - Strong advanced capability demo
5. **Easy to test and validate** - Technical decisions are objective
6. **Professional appeal** - Aligns with rubric's focus on serious use cases

**Implementation Priorities:**
1. **Thread Summarization** - Focus on technical discussions, decisions, blockers
2. **Action Item Extraction** - Track tasks, assignees, deadlines (structured output)
3. **Semantic Search (RAG)** - Enable finding technical decisions across history
4. **Priority Detection** - Flag urgent production issues, blockers
5. **Decision Tracking** - Timeline of architectural/technical decisions
6. **Scheduling Agent** - Multi-step timezone-aware meeting scheduler

**Demo Script:**
- Show: Remote team discussion (3+ timezones, technical decisions)
- Use: All 5 AI features to manage async communication
- Highlight: Scheduling agent coordinating meeting across timezones
- Impact: "Saves 2+ hours/week per team member on communication overhead"

---

### Alternative: Content Creator (if you want to stand out)

**Why:**
- Unique creative angle (most students will choose professional)
- Feedback summarization is very practical
- Project manager agent is impressive
- Demo video will be visually engaging

**Trade-off**: Slightly lower technical depth, harder to measure accuracy objectively.

---

## Next Steps

1. **Choose your persona** (recommended: Remote Team Professional)
2. **Update TASK_LIST.md** - Customize all AI feature prompts and examples for chosen persona
3. **Create brainlift document** (PR #13) - Document persona, pain points, feature mapping
4. **Start implementation** (PR #14-21) - Build AI features tailored to persona

**Decision Required**: Which persona do you choose?


