#!/usr/bin/env bash
# Legacy wrapper — calls `tfg stats --update-readme`.
# Kept so older docs / muscle memory still work.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/tfg" stats --update-readme
