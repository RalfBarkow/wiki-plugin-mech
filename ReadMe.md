# Federated Wiki - Mech Plugin

The Mech plugin can be configured to perform many useful workflows on a single page.
See the Mech Handbook were we describe the building blocks and how they work together.

http://mech.fed.wiki/

## Build

    npm install
    npm run build

## Contributing

- Add upstream remote: `git remote add upstream https://github.com/wardcunningham/wiki-plugin-mech.git`
- Rebase regularly: `git fetch upstream` then `git rebase upstream/main`
- Use feature branches for changes; avoid committing directly to `main`
- Use `release/*` branches for releases
- Dev snapshots use `0.1.28-dev.N` and should not land on `main`

## License

MIT
