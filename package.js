/* eslint-disable no-undef */
Package.describe({
    name: 'socialize:friendships',
    summary: 'A social friendship package',
    version: '1.1.3',
    git: 'https://github.com/copleykj/socialize-friendships.git',
});

Package.onUse(function _(api) {
    api.versionsFrom(['1.10.2', '2.3','3.0']);

    api.use([
        'check',
        'reywood:publish-composite',
        'socialize:user-blocking',
        'socialize:requestable',
    ]);

    api.imply('socialize:user-blocking');

    api.mainModule('server/server.js', 'server');
    api.mainModule('common/common.js', 'client');
});
