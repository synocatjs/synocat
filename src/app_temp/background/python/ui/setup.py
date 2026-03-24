#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="synocat-service",
    version="1.0.0",
    author="Synology Community",
    description="Background service for Synology DSM 7 packages",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/synology/synocat",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
    entry_points={
        "console_scripts": [
            "synocat-service=synocat_service:main",
        ],
    },
)