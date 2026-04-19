#!/bin/sh
set -e

# 依存関係を最新に同期
pnpm install --frozen-lockfile

exec "$@"
