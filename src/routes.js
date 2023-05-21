const routes = [
  {
    method: 'GET',
    path: '/users',
    handler: () => {},
  },
  {
    method: 'POST',
    path: '/users/signin',
    handler: () => {},
  },
  {
    method: 'POST',
    path: '/users/signup',
    handler: () => {},
  },

  {
    method: 'GET',
    path: '/articles',
    handler: () => {},
  },
  {
    method: 'GET',
    path: '/articles/{id}',
    handler: () => {},
  },
  {
    method: 'POST',
    path: '/articles',
    handler: () => {},
  },
  {
    method: 'PUT',
    path: '/articles/{id}',
    handler: () => {},
  },
  {
    method: 'DELETE',
    path: '/articles/{id}',
    handler: () => {},
  },
  {
    method: 'POST',
    path: '/articles/{id}/like',
    handler: () => {},
  },
  {
    method: 'POST',
    path: '/articles/{id}/comments',
    handler: () => {},
  },

  {
    method: 'GET',
    path: '/images/{id}',
    handler: () => {},
  },
];

module.exports = routes;
