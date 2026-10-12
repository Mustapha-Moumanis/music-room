import places from '../content/morocco-places.json';

export type MoroccoPlace = {
  name: string;
  region: string;
};

// Keep this typed adapter so screen code stays independent from JSON imports.
export const moroccoPlaces = places satisfies MoroccoPlace[];
