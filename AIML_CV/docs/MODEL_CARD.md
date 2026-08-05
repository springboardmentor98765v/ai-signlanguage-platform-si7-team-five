# Sign Language AI/CV Model Card — Milestone 3

## What it does
Detects a hand in an image (MediaPipe HandLandmarker), extracts a 14-dimensional
feature vector (fingertip-to-wrist distances, per-finger curl angles, adjacent-
fingertip spread), and classifies it into one of 24 static ASL letters using a
KNN classifier. Served via FastAPI `/predict`, including a `possible_issue` hint
field (see calibration caveat below).

## Coverage
24 of 26 letters. **J and Z excluded by design** — both are motion-based signs
(traced in the air), fundamentally incompatible with this single-frame, static-
image architecture. Photos for J/Z were collected but withheld from training.
Future work: multi-frame/video tracking would be needed to support them.

## Training data
- 68 real photos across 24 letters (~2.8 per letter, most letters have 2-3)
- Augmented to 288 samples (12/class) via feature-level noise jitter, used
  only to top up thin classes for a valid stratified train/test split
- Meaningful improvement over Milestone 2: most classes now have genuinely
  different real photos, not just one photo's synthetic variants — the
  train/test split for these classes is real, not leaked

## Accuracy
**93.1% test accuracy** (72 held-out samples, stratified split). Per-class
detail in `day3_m3_augment_train.py` output — most letters at 100%, weak
spots below.

## Known limitations (with root causes, not just symptoms)

### 1. K/P/V confusion — architectural, not a data problem
K and P are the *same hand shape*, differing only by orientation (K points up,
P points down). V is a near-subset of K. Our feature set was deliberately
built orientation-invariant (Milestone 1 design choice, so rotation/camera
angle doesn't affect other letters) — but this means it cannot distinguish
pairs where orientation IS the defining difference. Q/G is the same kind of
pair for the same reason.

**Fix attempted (Day 6): added a hand-orientation angle feature. REJECTED.**
Test accuracy dropped 93.1% -> 84.7%, K/P confusion persisted, and NEW
orientation-pair confusions appeared (G<->Q, which hadn't shown up before).
Most likely cause: with only ~2.8 real samples/class, KNN doesn't have enough
real data to use a 15th feature dimension reliably — it added noise rather
than signal. This is a genuine negative result, not an abandoned idea: it
tells us the real fix is more real, orientation-varied samples per letter,
not a quick feature-engineering patch on top of thin data.

### 2. Detection failure rate: 4.2% (3/71 real photos)
All 3 failures are the same photos identified in Milestone 2 (A_2, A_3, C_2) —
backlit, extreme camera angle. No new failures across 19 additional letters,
suggesting this is isolated to specific bad shooting conditions, not a general
robustness problem. See `docs/day8_conditions_report.md` for details.

### 3. `possible_issue` hint field — still not reliably calibrated
Threshold miscalibration identified in Milestone 2 persists: per-class
statistics computed on synthetic-augmentation-dominated data produce high
z-scores even for correct predictions. Only extreme deviations are flagged
(threshold=30) to reduce false positives. Real fix requires the same thing
as #1: more real per-class data.

## What's NOT yet done from the Milestone 3 plan
- Dynamic/word sign stretch goal (2-3 signs) — not attempted this session
- Model speed/size optimization pass — M2's speed (30ms) already well under
  the 1-2s SRS target, so this is lower urgency, but not formally verified
  for the 24-class model
- Multi-person/multi-lighting-condition testing — all data is from one
  person, one device

## Recommendation for next steps
- Collect 2-3 more real, deliberately varied-orientation samples specifically
  for K, P, V, M, N, G, Q — the identified weak classes — rather than blanket
  augmentation across all 24 letters
- Once real per-class sample count is higher (5+), retry the orientation
  feature experiment — the hypothesis (K/P differ by rotation) is still
  architecturally sound, it just needs more real data to pay off
