# HyperTrack — Hyperhidrosis Monitoring & Management System

**A Longitudinal Self-Reporting, Trigger Correlation, and Clinical Documentation Pipeline**

[![Docs](https://img.shields.io/badge/docs-mkdocs-blue)](https://aditya8rajput.github.io/Hyperhidrosis-Monitoring-System/)
[![Status](https://img.shields.io/badge/status-prototype--stage-green)]()
[![Tests](https://img.shields.io/badge/tests-pytest--passed-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Course project for **UCS503 — Software Engineering**, UCS503P (2026–27 ODD)  
> Thapar Institute of Engineering and Technology

---

## Course & Instructor Details

| Attribute | Details |
|---|---|
| **Course** | UCS503 — Software Engineering (UCS503P, 2026–27 ODD) |
| **Institute** | Thapar Institute of Engineering and Technology |
| **Faculty / Instructor** | Dr. Jeelani Asif |
| **Repository** | [Hyperhindrosis](https://github.com/simi-835/Hyperhindrosis) |

---

## Team

| Name | Branch | Roll No. | Email |
|---|---|---|---|
| **Prabhkirat Kaur** | AIML | 1024240024 | [pkaur_be24@thapar.edu](mailto:pkaur_be24@thapar.edu) |
| **Aditya Rajput** | AIML | 1024240145 | [arajput_be24@thapar.edu](mailto:arajput_be24@thapar.edu) |

---

## Overview

Hyperhidrosis (primary focal hyperhidrosis) is a dermatological condition characterized by uncontrollable, excessive sweating beyond physiological thermoregulatory needs, predominantly affecting the palms, soles, axillae, and craniofacial regions. Patients face substantial psychosocial distress, professional impairment, and dermatological complications. 

A primary obstacle in clinical management is the **retrospective recall bias** during dermatological consultations: patients struggle to quantify episodic frequency, recall diurnal peaks, or pinpoint specific aggravating triggers (e.g., stress spikes, ambient temperature changes, dietary stimuli, caffeine).

**HyperTrack** is a software-engineering-driven digital monitoring, trigger correlation, and clinical documentation system. It provides a structured daily sweat diary combined with a statistical correlation engine and automated clinical reporting pipeline.

> [!IMPORTANT]
> **Clinical Scope & Safety Boundary**:  
> HyperTrack is strictly an observation, tracking, and clinical documentation aid. It does **not** diagnose medical conditions, predict autonomous medical interventions, or prescribe treatments. All generated reports are designed to serve as patient-controlled consultation dossiers for licensed physicians and dermatologists.

---

## Problem Statement

1. **Recall Bias & Inaccurate Patient History**: Retrospective estimates given during 15-minute clinical visits routinely misjudge frequency, intensity, and duration.
2. **Unidentified Environmental & Psychosocial Triggers**: Patients rarely maintain structured logs connecting episodes with quantifiable variables like stress levels, ambient temperature, physical exertion, or caffeine intake.
3. **Absence of Standardized Metrics**: Clinicians need standardized scales such as the **HDSS (Hyperhidrosis Disease Severity Scale)** to track treatment response, but manual paper forms suffer from high attrition.
4. **Scattered Treatment Efficacy Records**: Patients trying topicals (aluminum chloride), iontophoresis, oral anticholinergics, or lifestyle changes lack an integrated longitudinal timeline showing pre- and post-treatment severity trends.

---

## Proposed Solution

HyperTrack implements a layered, test-driven software architecture composed of five core modules:

```text
               ┌────────────────────────────────┐
               │    Patient Diary / Web UI      │
               └───────────────┬────────────────┘
                               │ (REST / Streamlit Form)
                               ▼
               ┌────────────────────────────────┐
               │  Ingestion & Validation Engine │
               └───────────────┬────────────────┘
                               │ (Sanitized Relational Write)
                               ▼
               ┌────────────────────────────────┐
               │    Relational SQLite Store     │
               └───────────────┬────────────────┘
                               │ (Query / Temporal Slice)
                               ▼
               ┌────────────────────────────────┐
               │   Analytics & Correlation Core │
               │   (Pearson, HDSS, Diurnal Map) │
               └───────────────┬────────────────┘
                               │
               ┌───────────────┴────────────────┐
               ▼                                ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  Doctor Consultation Dossier │ │  Interactive Patient Dashboard│
│   (ReportLab Clinical PDF)   │ │    (Charts, Trends, Heatmap) │
└──────────────────────────────┘ └──────────────────────────────┘
```

### Pipeline Stages

| Stage | Subsystem | Description |
|---|---|---|
| **1. Ingestion & Validation** | `code/ingestion/` | Parses and strictly validates episode logs. Enforces numerical bounds (severity 1-10, stress 1-10), standardizes body areas and trigger categories, and rejects corrupted inputs. |
| **2. Storage & Persistence** | `code/database/` | Relational SQLite database with ACID compliance, maintaining referential integrity across Users, Episodes, Triggers, and Treatment Sessions. |
| **3. Analytics Engine** | `code/analytics/` | Computes Pearson trigger-severity correlation coefficients, calculates diurnal 24-hour distribution peaks, and tracks longitudinal HDSS scores across treatment interventions. |
| **4. Predictive Classification** | `code/analytics/classifier.py` | Supervised machine learning module (Random Forest / Logistic Regression) categorizing severity levels (Low / Moderate / High) from multidimensional contextual features. |
| **5. Clinical Reporting** | `code/reporting/` | Compiles validated episodes, summary metrics, trigger rankings, and HDSS trajectories into audit-ready CSV exports and publication-grade consultation PDFs. |

---

## Software Engineering Diagrams

The system architecture and behavioral models have been documented across 12 comprehensive diagrams available in [`docs/diagrams/`](docs/diagrams/):

| Diagram | Focus | Formats |
|---|---|---|
| **DFD Level 0** | Context Diagram & System Boundary | [SVG](docs/diagrams/DFD_level0.svg) \| [PNG](docs/diagrams/DFD_level0.png) |
| **DFD Level 1** | Subsystem Decomposition & Data Stores (D1–D3) | [SVG](docs/diagrams/DFD_level1.svg) \| [PNG](docs/diagrams/DFD_level1.png) |
| **DFD Level 2 (Episode)** | Ingestion, Validation & Persistence Decomposition | [SVG](docs/diagrams/DFD_level2_episode.svg) \| [PNG](docs/diagrams/DFD_level2_episode.png) |
| **DFD Level 2 (Analytics)** | Pearson Correlation & Diurnal Peak Processing | [SVG](docs/diagrams/DFD_level2_analytics.svg) \| [PNG](docs/diagrams/DFD_level2_analytics.png) |
| **Use Case Diagram** | Actor interactions (Patient, Clinician, System) | [SVG](docs/diagrams/UseCaseDiagram.svg) \| [PNG](docs/diagrams/UseCaseDiagram.png) |
| **Activity Diagram** | Parallel processing from diary logging to analytics | [SVG](docs/diagrams/ActivityDiagram.svg) \| [PNG](docs/diagrams/ActivityDiagram.png) |
| **ER Diagram** | Normalized database schema & foreign key relationships | [SVG](docs/diagrams/ER_diagram.svg) \| [PNG](docs/diagrams/ER_diagram.png) |
| **Gantt Chart** | 6-week sprint milestone schedule | [SVG](docs/diagrams/GanttChart.svg) \| [PNG](docs/diagrams/GanttChart.png) |
| **System Architecture** | 3-tier structure (Presentation, Core, Storage) | [SVG](docs/diagrams/SystemArchitecture.svg) \| [PNG](docs/diagrams/SystemArchitecture.png) |
| **Sequence Diagram** | Chronological message sequence for episode ingestion | [SVG](docs/diagrams/SequenceDiagram.svg) \| [PNG](docs/diagrams/SequenceDiagram.png) |
| **Class Diagram** | OOP domain models, methods, and service interfaces | [SVG](docs/diagrams/ClassDiagram.svg) \| [PNG](docs/diagrams/ClassDiagram.png) |
| **Component & Deployment** | Execution environment, client-server runtime, packaging | [SVG](docs/diagrams/ComponentDeployment.svg) \| [PNG](docs/diagrams/ComponentDeployment.png) |

---

## Dataset & Synthetic Benchmark

To ensure reproducible testing and development without privacy violations, HyperTrack includes a realistic synthetic dataset generator (`code/data/synthetic/generate.py`):
- **Cohort Size**: 60-day longitudinal patient diary.
- **Controlled Injections**: Synthetically configured ground truth correlations (e.g., elevated stress and ambient heat strongly correlated with palmar and axillary episodes).
- **Ground Truth Reference**: `code/data/synthetic/ground_truth.json` enables automated regression testing of analytics calculations.

---

## Tech Stack

- **Language & Runtime:** Python 3.10+
- **Data & Analytics:** `pandas`, `numpy`, `scikit-learn`
- **Database:** SQLite (Relational SQL with SQLAlchemy models)
- **Reporting:** `ReportLab` (PDF generator) & standard Python CSV engine
- **User Interface:** `Streamlit` interactive reactive dashboard
- **Testing & QA:** `pytest`, `flake8`
- **Documentation:** `MkDocs` with `Material for MkDocs`, KaTeX mathematical typography

---

## Evaluation Criteria

| Metric | Target | Measurement Method |
|---|---|---|
| **Validation Precision** | 100% invalid inputs rejected | Pytest boundary checks on out-of-range severity, stress, missing timestamps |
| **Correlation Fidelity** | Pearson $r$ error $< 0.05$ | Evaluated against pre-computed synthetic ground truth statistics |
| **Diurnal Peak Detection** | Accuracy $\ge 95\%$ | Detection of known morning/afternoon peak episode distribution clusters |
| **Report Generation Time** | $< 1.5$ seconds | Benchmark for multi-page clinician PDF compilation |
| **Test Suite Coverage** | $\ge 90\%$ branch coverage | Automated Pytest matrix running across all subsystems |

---

## Project Structure

```text
.
├── .github/workflows/          # CI/CD test and documentation deployment workflows
├── assets/                     # Institutional branding, logos, and stylesheets
├── docs/                       # Comprehensive project documentation
│   ├── diagrams/               # 12 high-resolution SVG and PNG architectural diagrams
│   ├── criteria-for-project-selection.md
│   ├── problem-statement.md
│   ├── srs.md
│   ├── system-design.md
│   ├── testing.md
│   └── aiml.md
├── journals/                   # Weekly reflective engineering journals
│   ├── 1024240024-Prabhkirat_Kaur/
│   └── 1024240145-Aditya_Rajput/
├── project-proposal/           # LaTeX source for the UCS503 project proposal
├── project-report-prototype-stage/ # LaTeX prototype stage report
├── project-report-final/       # LaTeX final stage report
├── code/                       # Complete Python implementation
│   ├── common/                 # Configuration and domain schemas
│   ├── database/               # Database management and migrations
│   ├── ingestion/              # Input validation and file loader
│   ├── analytics/              # Pearson correlation, HDSS tracker, ML classifier
│   ├── reporting/              # PDF and CSV clinical report builders
│   ├── ui/                     # Streamlit web dashboard
│   ├── data/synthetic/         # Synthetic diary generator & ground truth
│   ├── tests/                  # Pytest automated test suite
│   ├── output/                 # Destination for generated clinical dossiers
│   └── main.py                 # CLI entry point
├── Makefile                    # Standard developer commands
├── mkdocs.yml                  # MkDocs site configuration
├── pyproject.toml              # Project metadata & tool config
└── README.md                   # Project landing page
```

---

## Quick Start & Usage

### 1. Environment Setup
```bash
git clone https://github.com/Aditya8Rajput/Hyperhidrosis-Monitoring-System.git
cd Hyperhidrosis-Monitoring-System
python3 -m venv .venv
source .venv/bin/activate
pip install -r code/requirements.txt
```

### 2. Generate Synthetic Benchmark & Run Ingestion
```bash
python3 code/main.py --seed
```

### 3. Run Automated Tests
```bash
make test
# or: pytest code/tests/ -v
```

### 4. Generate Clinical Consultation Report
```bash
python3 code/main.py --report
```
The compiled PDF dossier is saved to `code/output/clinical_summary_report.pdf`.

### 5. Launch Interactive Web Dashboard
```bash
make run
# or: streamlit run code/ui/app.py
```

---

## Documentation Site

The project documentation is built with [MkDocs](https://www.mkdocs.org/) using the Material theme:
```bash
make docs
```
Access the local preview at `http://127.0.0.1:8000`.

---

## Project Roadmap

### Prototype Stage (Completed)
- [x] Comprehensive requirements engineering & SRS formulation (FR-01 to FR-10)
- [x] Complete architecture diagram suite (12 DFD, UML, and behavioral models)
- [x] SQLite relational schema with referential integrity
- [x] Validation and ingestion pipeline with boundary enforcement
- [x] Pearson trigger correlation engine & diurnal profiler
- [x] Synthetic benchmark generator with known ground truth
- [x] Automated Pytest test suite and GitHub Actions CI workflow

### Final Stage (Subsequent Deliverables)
- [x] Interactive Streamlit web diary and clinical visualization suite
- [x] ReportLab clinician-facing consultation PDF exporter
- [x] Machine learning severity classification module
- [ ] Mobile-responsive PWA (Progressive Web App) offline caching
- [ ] Bluetooth LE telemetry intake from commercial sweat rate sensors

---

## License

This project is licensed under the [MIT License](LICENSE), permitting open academic and commercial exploration with attribution.

---

## Contact & Team

For questions, academic inquiries, or code review:
- **Prabhkirat Kaur** — [pkaur_be24@thapar.edu](mailto:pkaur_be24@thapar.edu)
- **Aditya Rajput** — [arajput_be24@thapar.edu](mailto:arajput_be24@thapar.edu)
- Course: UCS503 Software Engineering, Thapar Institute of Engineering & Technology
