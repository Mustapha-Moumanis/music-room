import { ProfileVisibility } from '@prisma/client';
import { Relationship } from '../friends/dto/friend.dto';

export interface VisibleSections {
  friends: boolean;
  private: boolean;
  music: boolean;
}

/**
 * The single place that decides which profile groups a viewer may see. Public info is always visible;
 * a pending request in either direction grants nothing beyond what a stranger sees.
 */
export function visibleSections(relationship: Relationship, musicVisibility: ProfileVisibility): VisibleSections {
  const self = relationship === 'SELF';
  const friend = relationship === 'FRIENDS';
  return {
    friends: self || friend,
    private: self,
    music: self
      || musicVisibility === ProfileVisibility.PUBLIC
      || (musicVisibility === ProfileVisibility.FRIENDS && friend),
  };
}
