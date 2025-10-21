# Project Brief: Pigeon AI

## Project Overview

**Project Name**: Pigeon AI  
**Type**: Cross-Platform AI-Enhanced Messaging Application  
**Timeline**: 7-day sprint (October 20-27, 2025)  
**Organization**: Gauntlet AI - Week 2 Project  

## Core Mission

Build a production-quality messaging application that combines WhatsApp-like reliability with intelligent AI features tailored to solve real communication problems for a specific user persona.

## Project Context

This is a one-week intensive project with three key milestones:
- **MVP**: Tuesday (24 hours) - Hard gate, must pass to continue
- **Early Submission**: Friday (4 days) - Enhanced features
- **Final Submission**: Sunday (7 days) - Full product with demo

## Primary Goal

Create a functional AI-enhanced messaging platform that demonstrates:
1. **Solid messaging infrastructure** - Real-time delivery, offline support, persistence
2. **AI-powered features** - Practical AI capabilities that solve real user problems
3. **Production quality** - Reliable, smooth, and polished user experience

## Success Criteria

The project succeeds when:
- ✅ Two users can reliably exchange messages in real-time
- ✅ Messages persist through app restarts and survive offline periods
- ✅ Group chat functionality works with 3+ users
- ✅ AI features demonstrably improve the messaging experience
- ✅ App is deployed (TestFlight/APK or local with backend deployed)
- ✅ Demo video showcases all core functionality

## Project Scope

### In Scope (MVP - 24 hours)
- One-on-one chat with real-time delivery
- Group chat (3+ users)
- Message persistence and offline support
- Optimistic UI updates
- Online/offline status indicators
- Message timestamps and read receipts
- User authentication and profiles
- Basic image sharing
- Push notifications (at least foreground)
- 5 AI features + 1 advanced AI capability for chosen persona

### Out of Scope (Post-MVP)
- End-to-end encryption
- Voice/video calls
- Advanced media sharing (videos, files, voice messages)
- Message editing/deletion
- Multi-platform support (focus on one platform for MVP)

## Chosen Direction

**User Persona**: Remote Team Professional (software engineers, designers, PMs)  
**Platform**: iOS (Swift + SwiftUI)  
**Backend**: Firebase (Firestore, Auth, Cloud Functions, FCM)  
**AI Provider**: OpenAI GPT-4 with AI SDK by Vercel  

## Key Constraints

1. **Time**: 24 hours to functional MVP
2. **Quality Bar**: Must be production-ready, not just proof-of-concept
3. **Testing**: Must pass offline scenarios and handle poor network conditions
4. **Deployment**: Backend must be deployed, app must be distributable

## What Makes This Challenging

1. **Real-time sync** is complex - handling online/offline, message ordering, conflict resolution
2. **Message delivery reliability** - zero message loss even through crashes
3. **Offline support** - app must work smoothly without connectivity
4. **AI latency** - managing 2-10 second AI response times
5. **Integration complexity** - mobile app + backend + AI services + push notifications

## Definition of Done (MVP)

All these must work reliably:
1. Two devices exchanging messages in real-time (<2 sec latency)
2. Offline test: go offline → receive messages → come online → messages deliver
3. App survives force quit (persistence works)
4. Group chat with 3+ users
5. All 5 required AI features + 1 advanced feature respond correctly
6. Push notifications trigger (foreground minimum)
7. Images can be sent and received
8. Code on GitHub with README
9. Backend deployed
10. App distributable (TestFlight or local setup instructions)

## Why This Project Matters

Messaging is fundamental to human communication. Adding AI that genuinely helps (not gimmicks) represents the future of how people will interact. This project teaches:
- Building reliable distributed systems
- Real-time data synchronization
- Mobile development best practices
- Integrating AI into user-facing products
- Shipping complete products under time pressure

## Inspiration

WhatsApp was built by 2 developers in months and serves 2+ billion users. With modern AI coding tools, we can build comparable infrastructure in one week and add AI features that didn't exist when WhatsApp launched.



