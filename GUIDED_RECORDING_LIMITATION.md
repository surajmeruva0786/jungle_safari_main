# Guided Voice Recording - Known Limitation

## Issue
The 16-question guided voice recording currently only captures the last question's answer (~12 seconds) instead of all 16 responses.

## Root Cause
The `GuidedVoiceRecording` component attempts to combine multiple WebM audio blobs by concatenating them:

```typescript
const allBlobs = [...previousBlobs, currentAnswerBlob];
const finalAudioBlob = new Blob(allBlobs, { type: 'audio/webm' });
```

**This doesn't work** because WebM is a container format with headers and metadata. Concatenating multiple WebM files creates an invalid audio file with multiple headers, causing transcription services to only read the first segment.

## Current Workaround
**Use the regular voice recording button instead of the guided recording:**
1. Click the regular "Start Recording" button
2. Speak all your observations continuously in one session
3. Stop the recording
4. Submit the log

This works perfectly because it creates a single, valid WebM audio file.

## Proper Fix (Future Implementation)

To make guided recording work, we need to:

### Option 1: Individual Transcription (Recommended)
1. Modify `GuidedVoiceRecording.tsx` to send each answer to the backend immediately after recording
2. Collect all 16 transcripts
3. Combine the transcripts into one text string
4. Send the combined text for AI processing

### Option 2: Use WAV Format
1. Switch from WebM to WAV format for recording
2. WAV files can be concatenated more easily (though still requires proper audio processing)

### Option 3: Server-Side Audio Merging
1. Send all 16 audio blobs to the backend as separate files
2. Use FFmpeg or similar tool on the server to properly merge the audio files
3. Transcribe the merged file

## Recommendation
For now, **use the regular voice recording** for comprehensive logs. The guided recording feature should be disabled or marked as "experimental" until a proper fix is implemented.

## Test Case
If you record:
- Question 1: "The animal ate 50% of food" (5 seconds)
- Question 2: "Water consumption was normal" (3 seconds)  
- Question 3: "No injuries observed" (2 seconds)

**Current behavior**: Only Question 3 is transcribed  
**Expected behavior**: All 3 answers should be transcribed and combined
