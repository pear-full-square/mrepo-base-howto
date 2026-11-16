// The howto protocol's config: get, its default action (howto alone is
// howto/get), and extract; both at the mrepo itself (`.`).
export const CONFIG = {
  description: 'The mrepo\'s how-tos, by activity: what can be done here, and how.',
  default: 'get',
  actions: {
    get: { uris: ['.'], args: ['what?'], description: 'The activities here, each with its how-tos (no argument); an activity\'s how-tos (<activity>); one how-to, its steps as typed commands, each with why (<activity>/<name>).' },
    extract: { uris: ['.'], description: 'The howto layer extracted from the linked packages\' how-tos.' }
  }
}
