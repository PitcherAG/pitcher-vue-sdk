module.exports = {
  branches: [{ name: 'main' }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    // npmPublish is off: semantic-release 17 can't publish through npm trusted
    // publishing (OIDC). It still writes the new version into package.json, and
    // the "Publish to npm" step of release-and-publish.yml publishes it.
    ['@semantic-release/npm', { npmPublish: false, pkgRoot: '.' }],
    [
      '@semantic-release/github',
      {
        successComment: false,
        failComment: false,
        releasedLabels: [
          // eslint-disable-next-line max-len
          'released<%= nextRelease.channel ? ` on ${nextRelease.channel}@${nextRelease.version}` : "" %> from <%= branch.name %>',
        ],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md'],
        message: 'chore(release): set `package.json` to ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
}
