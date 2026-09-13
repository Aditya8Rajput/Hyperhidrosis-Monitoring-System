.PHONY: help install seed test run report docs clean lint

PYTHON := python3
PIP := pip

help:
	@echo "HyperTrack Build and Management Commands"
	@echo "----------------------------------------"
	@echo "make install  : Install runtime & test dependencies"
	@echo "make seed     : Generate synthetic patient benchmark data"
	@echo "make test     : Run automated pytest test suite"
	@echo "make report   : Generate doctor-ready clinical PDF report"
	@echo "make run      : Start interactive Streamlit dashboard"
	@echo "make docs     : Serve MkDocs documentation portal"
	@echo "make lint     : Run code style and syntax checks"
	@echo "make clean    : Remove compiled bytecode and temporary outputs"

install:
	$(PIP) install -r code/requirements.txt

seed:
	$(PYTHON) code/main.py --seed

test:
	$(PYTHON) -m pytest code/tests/ -v

report:
	$(PYTHON) code/main.py --report

run:
	streamlit run code/ui/app.py

docs:
	mkdocs serve

lint:
	flake8 code/ --max-line-length=100 || true

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache code/output/temp*
