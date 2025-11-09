import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/people', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const hasNext = page < 3;
    const data = Array.from({ length: 2 }, (_, i) => ({
      id: `p${page}-${i}`,
      name: `Person ${page}-${i}`,
    }));
    return HttpResponse.json({ data, nextPage: hasNext ? page + 1 : null });
  }),
];
