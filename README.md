# Live Polling System

## Personas

1. Teacher
2. Student

## Teacher

The teacher should be able to:

-   Create a new poll
-   View live polling results
-   Ask a new question only if no question was asked previously or if all the students have answered the question

## Student

The student should be able to:

-   Enter their name while visiting for the first time (this should be unique only to a tab)
-   Once the teacher asks a question, the student should be able to submit their answer
-   See the live polling results after submitting the answer
-   Have a maximum of 60 seconds to answer a question, after which they will see the live polling results

## Technologies to be used

-   Frontend: React, Redux (optional)
-   Backend: Polling powered by socket.io, server based on ExpressJs

## Must-haves

-   The system should be functional
-   Teacher should be able to ask polls
-   Students should be able to answer them
-   Both teacher and student should be able to view poll results

## Good to have

-   Teacher should be able to configure the maximum time for a poll
-   Teacher should be able to kick a student out
-   The website should be properly designed

## Tasks for Brownie Points

-   Implement a chat popup for students and teachers to interact
-   Teacher should be able to view past poll results (not from local storage)
-   Host the full solution website + backend
