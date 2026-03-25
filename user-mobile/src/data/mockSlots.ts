type ParkingSlot = {
  id: string;
  locationName: string;
  status: 'Available' | 'Occupied';
  distance: string;
  rate: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

const mockSlots: ParkingSlot[] = [
  {
    id: 'slot-1',
    locationName: 'Sudirman Central Parking',
    status: 'Available',
    distance: '0.4 km',
    rate: 'Rp 5.000/hour',
    coordinate: {
      latitude: -6.21462,
      longitude: 106.84513,
    },
  },
  {
    id: 'slot-2',
    locationName: 'Grand Indonesia Parking',
    status: 'Occupied',
    distance: '1.1 km',
    rate: 'Rp 6.000/hour',
    coordinate: {
      latitude: -6.19688,
      longitude: 106.82299,
    },
  },
  {
    id: 'slot-3',
    locationName: 'Plaza Senayan Basement',
    status: 'Available',
    distance: '2.5 km',
    rate: 'Rp 7.000/hour',
    coordinate: {
      latitude: -6.22501,
      longitude: 106.79911,
    },
  },
  {
    id: 'slot-4',
    locationName: 'Kuningan City Parking Deck',
    status: 'Occupied',
    distance: '3.2 km',
    rate: 'Rp 5.500/hour',
    coordinate: {
      latitude: -6.22343,
      longitude: 106.83061,
    },
  },
  {
    id: 'slot-5',
    locationName: 'Blok M Square Parking',
    status: 'Available',
    distance: '4.8 km',
    rate: 'Rp 4.500/hour',
    coordinate: {
      latitude: -6.24467,
      longitude: 106.80048,
    },
  },
];

export default mockSlots;