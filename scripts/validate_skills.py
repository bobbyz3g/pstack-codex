"""Validate independently installable skill packages and their provenance."""

import json
from pathlib import Path
import re
import sys

import yaml


def validate(root):
    catalog = json.loads((root / "UPSTREAM.json").read_text(encoding="utf-8"))
    directories = {p.name for p in (root / "skills").iterdir() if p.is_dir()}
    if directories != set(catalog["skills"]):
        raise ValueError("skills directories and UPSTREAM.json entries differ")
    for name, entry in catalog["skills"].items():
        directory = root / "skills" / name
        text = (directory / "SKILL.md").read_text(encoding="utf-8")
        match = re.match(r"\A---\s*\n(.*?)\n---\s*\n(.+)", text, re.S)
        if not match:
            raise ValueError(f"{name}: missing frontmatter or instructions")
        metadata = yaml.safe_load(match[1])
        if metadata.get("name") != name or not re.fullmatch(r"[a-z0-9-]{1,64}", name):
            raise ValueError(f"{name}: invalid or mismatched skill name")
        if not isinstance(metadata.get("description"), str) or not metadata["description"].strip():
            raise ValueError(f"{name}: missing description")
        if "disable-model-invocation" in metadata:
            raise ValueError(f"{name}: use agents/openai.yaml for Codex invocation policy")
        config = yaml.safe_load((directory / "agents/openai.yaml").read_text(encoding="utf-8"))
        if type(config.get("policy", {}).get("allow_implicit_invocation")) is not bool:
            raise ValueError(f"{name}: invocation policy must be a YAML boolean")
        source = json.loads((directory / "UPSTREAM.json").read_text(encoding="utf-8"))
        for key in ("commit", "path"):
            if source[key] != entry[key]:
                raise ValueError(f"{name}: inconsistent upstream {key}")
        if not re.fullmatch(r"[0-9a-f]{40}", source["commit"]):
            raise ValueError(f"{name}: upstream commit must be pinned")
        if source["repository"] != catalog["repository"]:
            raise ValueError(f"{name}: inconsistent upstream repository")
        if source["adaptation"] != f"{name}-{entry['adaptation']}":
            raise ValueError(f"{name}: inconsistent adaptation version")
        if entry["details"] != f"skills/{name}/UPSTREAM.json":
            raise ValueError(f"{name}: invalid provenance location")
        if (directory / "LICENSE").read_bytes() != (root / "LICENSE").read_bytes():
            raise ValueError(f"{name}: missing or inconsistent license")
        print(f"PASS {name}: metadata, invocation policy, provenance, license")


if __name__ == "__main__":
    try:
        validate(Path(__file__).resolve().parents[1])
    except (ValueError, KeyError, TypeError, AttributeError, OSError, yaml.YAMLError) as error:
        sys.exit(str(error))
