export default {
  model: {
    provider: 'volcengine',
    id: 'ep-20250510145437-5sxhs',
    apiKey: process.env.ARK_API_KEY,
  },
  webui: {
    logo: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
    title: 'Github Agent',
    subtitle: 'An Autonomous Agent that automates Github workflows',
    welcomTitle: 'Automate your Github workflow 🚀',
    welcomePrompts: [
      'Review this pull request: https://github.com/bytedance/UI-TARS-desktop/pull/1024',
    ],
    enableContextualSelector: true,
  },
};
