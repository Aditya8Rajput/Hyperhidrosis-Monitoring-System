# Week_05 — Analytics Pipeline — Pearson Correlation & Diurnal Binning

**Project:** HyperTrack — Hyperhidrosis Monitoring and Management System  
**Team Member:** Aditya Rajput  
**Week:** 31-Aug-2026 to 06-Sep-2026

## Work Completed

- Engineered the statistical correlation engine (`code/analytics/correlation.py`) computing Pearson correlation coefficients ($r$) between stressors and severity.
- Implemented diurnal circadian binning (`code/analytics/diurnal.py`) grouping episode frequencies across a 24-hour cycle.
- Built quantitative trigger ranking algorithms to distinguish between thermal environmental spikes and psychological stress triggers.
- Benchmarked correlation accuracy against known synthetic ground-truth values ($r pprox 0.65$), verifying sub-percent precision.
- Constructed automated unit tests for analytics (`code/tests/test_analytics.py`).

## Team Collaboration

Held working sessions to integrate analytics outputs into the clinical PDF reporting module and discussed chart formatting with the team.
