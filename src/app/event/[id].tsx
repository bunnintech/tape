import { useLocalSearchParams } from 'expo-router';

import EventScreen from '@/features/event/EventScreen';

export default function EventRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EventScreen eventId={String(id)} />;
}
