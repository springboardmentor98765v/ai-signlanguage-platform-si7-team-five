# Sign Language AI/CV Model Card — Milestone 2

## What it does
Detects a hand in an image (MediaPipe HandLandmarker), extracts a 14-dimensional
feature vector (fingertip-to-wrist distances, per-finger curl angles, adjacent-
fingertip spread), and classifies it into one of 5 ASL letters (A, B, C, L, Y)
using a KNN classifier. Served via FastAPI `/predict` endpoint.

## Training data
- 5 real photos (1 per letter), all from one person, one device, one session
- Augmented to 205 samples (41/class) via landmark-level rotation/scale/noise jitter
- **This is NOT equivalent to real diverse data.** Augmentation multiplies a single
  pose's variation; it does not capture different people, hand sizes, skin tones,
  lighting setups, or genuinely different hand angles.

## Accuracy — read carefully, two different numbers exist

| Metric | Value | What it actually measures |
|---|---|---|
| Train/test split on augmented data | 100% | Same-source leakage — augmented variants of the same real photo appear in both train and test. Not a generalization measure. |
| **Real generalization test (10 fresh, unseen photos)** | **85.7%** (6/7 detected samples) | The honest number. Excludes 3 photos where detection itself failed (see below). |

## Known limitations

1. **Detection failure rate: 20%** (3/15 tested photos). Root cause identified:
   backlighting, extreme camera angle, and sensor noise — not specific to our
   code, a general hand-tracking limitation. See `docs/day8_conditions_report.md`.
2. **Confusion observed:** L misclassified as B once in real testing (index-middle
   finger spread was the deviating feature). Synthetic-data centroid analysis
   had predicted C/Y as the risk pair instead — real data did not confirm that;
   L/B was the actual miss. This shows synthetic-data analysis alone is not a
   reliable predictor of real confusion pairs.
3. **`possible_issue` hint feature (Day 7) is architecturally sound but not yet
   reliably calibrated** — thresholds computed from synthetic-dominated per-class
   stats cannot cleanly separate "correct but naturally-varying real photo" from
   "genuinely wrong prediction" (both produce high z-scores). Needs real diverse
   samples per class to calibrate correctly.
4. Only 5 of 24 target static letters currently implemented (A, B, C, L, Y).
   J and Z excluded by design (motion-based signs, incompatible with static-image
   architecture).

## Performance
- Mean prediction latency: 30.4ms (detection + feature extraction + classification)
- SRS target was 1-2 seconds — current implementation is ~65x faster than required,
  well within budget for the remaining 19 letters to be added without risking
  the performance target.

## Recommendation for next steps (beyond Milestone 2 scope)
- Replace synthetic augmentation with real photos from multiple people, sessions,
  and lighting conditions — this single change would resolve limitations #2 and #3.
- Add on-screen capture guidance to the Frontend Practice page based on the Day 8
  findings (avoid backlighting, avoid extreme angles).
