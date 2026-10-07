import { ProfileVisibility } from '@prisma/client';
import { Relationship } from '../friends/dto/friend.dto';
import { visibleSections } from './profile-visibility';

describe('visibleSections', () => {
  it.each<[Relationship, ProfileVisibility, { friends: boolean; private: boolean; music: boolean }]>([
    ['SELF', 'PRIVATE', { friends: true, private: true, music: true }],
    ['FRIENDS', 'PUBLIC', { friends: true, private: false, music: true }],
    ['FRIENDS', 'FRIENDS', { friends: true, private: false, music: true }],
    ['FRIENDS', 'PRIVATE', { friends: true, private: false, music: false }],
    ['NONE', 'PUBLIC', { friends: false, private: false, music: true }],
    ['NONE', 'FRIENDS', { friends: false, private: false, music: false }],
    ['REQUEST_SENT', 'FRIENDS', { friends: false, private: false, music: false }],
    ['REQUEST_RECEIVED', 'FRIENDS', { friends: false, private: false, music: false }],
    ['REQUEST_RECEIVED', 'PUBLIC', { friends: false, private: false, music: true }],
  ])('%s viewing music=%s sees %o', (relationship, musicVisibility, expected) => {
    expect(visibleSections(relationship, musicVisibility)).toEqual(expected);
  });
});
