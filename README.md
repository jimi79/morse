Some javascript page to play morse

wpm = word per minutes
wpmf = word per minutes with farn pauses
PARIS: 50 di, with 7 di that are spaces after char + spaces after word
Time for a di without farn = 60 / (50 * wpm)
Time to send PARIS = 50 * time per di
Time to send a word with farn = 60 / wpm2
Time left that can be used with farn pauses = time to send with farn - time to send without farn
Time left = 60 / wpm2 - 60 / wpm
Time per fan item = time left / 7 di
Time per fan item = (60 / wpm2 - 60 / wpm) / 7
