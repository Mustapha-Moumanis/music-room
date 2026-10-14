import { canAudienceSeeProfileField } from '../features/profile-friends/model/profile-editor';

describe('profile editor visibility', () => {
  it('shows public fields to every preview audience', () => {
    expect(canAudienceSeeProfileField('public', 'public')).toBe(true);
    expect(canAudienceSeeProfileField('friend', 'public')).toBe(true);
  });

  it('shows friends-only fields only to the friend preview', () => {
    expect(canAudienceSeeProfileField('public', 'friends')).toBe(false);
    expect(canAudienceSeeProfileField('friend', 'friends')).toBe(true);
  });

  it('never exposes private fields in previews', () => {
    expect(canAudienceSeeProfileField('public', 'private')).toBe(false);
    expect(canAudienceSeeProfileField('friend', 'private')).toBe(false);
  });
});
