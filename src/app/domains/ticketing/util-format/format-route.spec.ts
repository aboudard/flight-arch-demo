import { formatRoute } from './format-route';

describe('formatRoute', () => {
  it('formate un trajet', () => {
    expect(formatRoute('Paris', 'Vienne')).toBe('Paris → Vienne');
  });
});
