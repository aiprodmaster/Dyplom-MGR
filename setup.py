#!/usr/bin/env python3
"""
ERP AI Assistant Setup
"""

from setuptools import setup, find_packages

setup(
    name="erp-ai-assistant",
    version="1.0.0",
    description="Inteligentne wsparcie procesu wdrożenia systemu ERP z wykorzystaniem AI",
    author="Łukasz",
    packages=find_packages(),
    install_requires=open("requirements.txt").read().splitlines(),
    python_requires=">=3.11",
    entry_points={
        "console_scripts": [
            "erp-assistant=deployment.scripts.quick-start:main",
        ],
    },
)
