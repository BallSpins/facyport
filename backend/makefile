.PHONY: test test-ai test-flow flush test-flush dev clean

test:
	python test_ai_service.py
	python test_report_flow.py

test-ai:
	python test_ai_service.py

test-flow:
	python test_report_flow.py

flush:
	python flush_db.py

test-flush: test
	@echo y | python flush_db.py

dev:
	uvicorn main:app --reload

clean:
	@if exist __pycache__ rmdir /s /q __pycache__
	@if exist build rmdir /s /q build
	@if exist fastapi_example.egg-info rmdir /s /q fastapi_example.egg-info